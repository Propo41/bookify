import { ApiResponse } from '../shared/dto/api.response';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth, ConferenceRoom, User } from './entities';
import { admin_directory_v1, google } from 'googleapis';
import appConfig from '../config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { IJwtPayload, LoginResponse } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import to from 'await-to-js';
import { createResponse } from '../helpers/payload.util';
import { GaxiosError, GaxiosResponse } from 'gaxios';
import { GoogleAPIErrorMapper } from 'src/helpers/google-api-error.mapper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ConferenceRoom)
    private conferenceRoomsRepository: Repository<ConferenceRoom>,
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    private jwtService: JwtService,
    private logger: Logger,
  ) {}

  async login(code: string, redirectUrl: string): Promise<ApiResponse<LoginResponse>> {
    const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, redirectUrl);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    const authPayload: Auth = {
      accessToken: tokens.access_token,
      scope: tokens.scope,
      expiryDate: tokens.expiry_date,
      tokenType: tokens.token_type,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
    };

    const existingUser = await this.getUser(data.id);
    if (existingUser) {
      const jwt = await this.createJwt(existingUser.id, existingUser.name, authPayload.expiryDate);
      await this.authRepository.update({ id: existingUser.authId }, authPayload);

      const res: LoginResponse = { accessToken: jwt };
      return createResponse(res);
    }

    const domain = data.email.split('@')[1];
    if (!(await this.isCalenderResourceExist(domain))) {
      await this.createCalenderResources(oauth2Client, domain);
    }

    const auth = await this.authRepository.save(authPayload);
    const user = await this.usersRepository.save({
      id: data.id,
      name: data.name,
      email: data.email,
      authId: auth.id,
      domain,
    });

    const jwt = await this.createJwt(user.id, user.name, authPayload.expiryDate);
    const res: LoginResponse = { accessToken: jwt };
    return createResponse(res);
  }

  async purgeAccess(oauth2Client: OAuth2Client) {
    const [err, _] = await to(oauth2Client.revokeCredentials());

    if (err) {
      this.logger.error(err);
      return false;
    }

    return true;
  }

  async createJwt(id: string, name: string, oAuthExpiry: number) {
    const payload: IJwtPayload = { sub: id, name: name, expiresIn: oAuthExpiry };
    const jwt = await this.jwtService.signAsync(payload, { secret: this.config.jwtSecret, expiresIn: oAuthExpiry * 2 });
    return jwt;
  }

  async getUser(id: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        id,
      },
      relations: {
        auth: true,
      },
    });

    return existingUser;
  }

  async logout(oauth2Client: OAuth2Client): Promise<ApiResponse<boolean>> {
    try {
      const res = await oauth2Client.revokeToken(oauth2Client.credentials.access_token);
      this.logger.log(`[logout]: revoke token success: ${res.status === 200}`);
      return createResponse(true);
    } catch (error) {
      this.logger.error(`[logout]: Error revoking token: ${error}`);
      return createResponse(false);
    }
  }

  async getFloorsByDomain(domain: string): Promise<string[]> {
    const result = await this.conferenceRoomsRepository
      .createQueryBuilder('conferenceRoom')
      .select('DISTINCT conferenceRoom.floor', 'floor')
      .where('conferenceRoom.domain = :domain', { domain })
      .orderBy('conferenceRoom.floor', 'ASC')
      .getRawMany();

    return result.map((row) => row.floor);
  }

  async getCalenderResources(domain: string) {
    const resources = await this.conferenceRoomsRepository.find({
      where: {
        domain,
      },
      order: {
        seats: 'ASC',
      },
    });

    return resources;
  }

  async isCalenderResourceExist(domain: string) {
    return await this.conferenceRoomsRepository.exists({ where: { domain } });
  }

  async createCalenderResources(oauth2Client: OAuth2Client, domain: string) {
    const service = google.admin({ version: 'directory_v1', auth: oauth2Client });
    const options = { customer: 'my_customer' };

    const [err, res]: [GaxiosError, GaxiosResponse<admin_directory_v1.Schema$CalendarResources>] = await to(service.resources.calendars.list(options));

    if (err) {
      GoogleAPIErrorMapper.handleError(err, (status: HttpStatus) => {
        if (status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException('No directory resources found. Are you using an organization account?');
        }
      });
    }

    if (res.status !== 200) {
      throw new NotFoundException("Couldn't obtain directory resources");
    }

    const rooms: ConferenceRoom[] = [];
    const { items: resources } = res.data;
    for (const resource of resources) {
      rooms.push({
        id: resource.resourceId,
        email: resource.resourceEmail,
        description: resource.userVisibleDescription,
        domain: domain,
        floor: resource.floorName, // in the format of F3 or F1, whatever the organization assigns
        name: resource.resourceName,
        seats: resource.capacity,
      });
    }

    await this.conferenceRoomsRepository.save(rooms);
    this.logger.log(`Conference rooms created successfully, Count: ${rooms.length}`);
  }
}
