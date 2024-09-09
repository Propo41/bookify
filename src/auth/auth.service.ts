import { ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, NotImplementedException } from '@nestjs/common';
import { Auth, User } from './entities';
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
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    private jwtService: JwtService,
    private logger: Logger,
  ) {}

  async login(code: string): Promise<LoginResponse> {
    const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, this.config.oAuthRedirectUrl);

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

      const auth = await this.authRepository.save(authPayload);
      const user = await this.usersRepository.save({
        id: data.id,
        name: data.name,
        email: data.email,
        authId: auth.id,
      });

      const jwt = await this.createJwt(user.id, user.name, authPayload.expiryDate);
      return { accessToken: jwt };
    } catch (error) {
      console.log(error.message);
      this.logger.error(error.message);

      if (error.message.includes('refreshToken')) {
        await this.logout(oauth2Client);
        throw new ConflictException('Something went wrong');
      }

      throw new InternalServerErrorException('Something went wrong');
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
      await oauth2Client.revokeCredentials();
      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }

  async refreshToken(user: User, oauth2Client: OAuth2Client): Promise<boolean> {
    const { token } = await oauth2Client.getAccessToken();
    if (token) {
      await this.authRepository.update(
        { id: user.authId },
        {
          accessToken: token,
          expiryDate: oauth2Client.credentials.expiry_date,
        },
      );

      return true;
    } else {
      throw new ConflictException('Failed to refresh token');
    }
  }
}
