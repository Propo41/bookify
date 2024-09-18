import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth, ConferenceRoom, User } from './entities';
import { google } from 'googleapis';
import appConfig from '../config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { IJwtPayload, LoginResponse } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

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

  async login(code: string, redirectUrl: string): Promise<LoginResponse> {
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

    try {
      const existingUser = await this.getUser(data.id);
      if (existingUser) {
        const jwt = await this.createJwt(existingUser.id, existingUser.name, authPayload.expiryDate);
        await this.authRepository.update({ id: existingUser.authId }, authPayload);

        return {
          accessToken: jwt,
        };
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
      return { accessToken: jwt };
    } catch (error) {
      this.logger.error(error.message);

      if (error.message.includes('refreshToken')) {
        await this.purgeAccess(oauth2Client);
        throw new UnauthorizedException('Refresh token not found. Log in again');
      } else if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  async purgeAccess(oauth2Client: OAuth2Client) {
    try {
      await oauth2Client.revokeCredentials();
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
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

  async logout(oauth2Client: OAuth2Client): Promise<boolean> {
    try {
      const res = await oauth2Client.revokeToken(oauth2Client.credentials.access_token);
      this.logger.log(`[logout]: revoke token success: ${res.status === 200}`);
      return true;
    } catch (error) {
      this.logger.error(`[logout]: Error revoking token: ${error}`);
      return false;
    }
  }

  async refreshToken(user: User, oauth2Client: OAuth2Client) {
    if (!oauth2Client.credentials.refresh_token) {
      throw new UnauthorizedException('Failed to refresh token. No refresh token found. Log in again');
    }

    const { token } = await oauth2Client.getAccessToken();
    if (token) {
      const updatePayload = {
        accessToken: token,
        expiryDate: oauth2Client.credentials.expiry_date,
      };

      await this.authRepository.update({ id: user.authId }, updatePayload);
      return updatePayload;
    } else {
      throw new UnauthorizedException('Failed to refresh token');
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
    try {
      const service = google.admin({ version: 'directory_v1', auth: oauth2Client });
      // https://developers.google.com/admin-sdk/directory/reference/rest/v1/resources.calendars/list]
      const options = { customer: 'my_customer' };
      const res = await service.resources.calendars.list(options);

      if (res.status !== 200) {
        throw new BadRequestException("Couldn't obtain directory resources");
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
    } catch (err) {
      this.logger.error(`Couldn't obtain directory resources`);
      throw new NotFoundException("Couldn't obtain directory resources");
    }
  }
}
