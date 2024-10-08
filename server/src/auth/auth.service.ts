import { LoginResponse } from '@bookify/shared';
import { ApiResponse } from '@bookify/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Auth, ConferenceRoom, User } from './entities';
import appConfig from '../config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { IJwtPayload } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import to from 'await-to-js';
import { createResponse } from '../helpers/payload.util';
import { GoogleApiService } from 'src/google-api/google-api.service';

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
    @Inject('GoogleApiService') private readonly googleApiService: GoogleApiService,
    private jwtService: JwtService,
    private logger: Logger,
  ) {}

  async login(code: string, redirectUrl: string): Promise<ApiResponse<LoginResponse>> {
    const oauth2Client = this.googleApiService.getOAuthClient(redirectUrl);
    const { tokens } = await this.googleApiService.getToken(oauth2Client, code);
    const userInfo = await this.googleApiService.getUserInfo(oauth2Client);

    const authPayload: Auth = {
      accessToken: tokens.access_token,
      scope: tokens.scope,
      expiryDate: tokens.expiry_date,
      tokenType: tokens.token_type,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
    };

    const existingUser = await this.getUser(userInfo.id);
    if (existingUser) {
      const jwt = await this.createJwt(existingUser.id, existingUser.name, authPayload.expiryDate);
      await this.authRepository.update({ id: existingUser.authId }, authPayload);

      const res: LoginResponse = { accessToken: jwt };
      return createResponse(res);
    }

    const domain = userInfo.email.split('@')[1];
    if (!(await this.isCalenderResourceExist(domain))) {
      await this.createCalenderResources(oauth2Client, domain);
    }

    const auth = await this.authRepository.save(authPayload);
    const user = await this.usersRepository.save({
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
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
      // const res = await oauth2Client.revokeToken(oauth2Client.credentials.access_token);
      // this.logger.log(`[logout]: revoke token success: ${res.status === 200}`);
      return createResponse(true);
    } catch (error) {
      // this.logger.error(`[logout]: Error revoking token: ${error}`);
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

  async getDirectoryResources(domain: string) {
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
    const { items } = await this.googleApiService.getCalendarResources(oauth2Client);

    const rooms: ConferenceRoom[] = [];
    for (const resource of items) {
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
