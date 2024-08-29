import { ForbiddenException, Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { Auth, User } from './entities';
import { google } from 'googleapis';
import appConfig from 'src/config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { LoginResponse } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
  ) {}

  async login(code: string): Promise<LoginResponse> {
    const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, 'http://localhost:8000');

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    if (data.hd !== 'cefalo.com') {
      throw new ForbiddenException('Only emails associated with cefalo are allowed.');
    }

    const user = await this.usersRepository.save({
      id: data.id,
      name: data.name,
      email: data.email,
    });

    await this.authRepository.save({
      userId: user.id,
      accessToken: tokens.access_token,
      scope: tokens.scope,
      expiryDate: tokens.expiry_date,
      tokenType: tokens.token_type,
    });

    const jwt = await this.createJwt();
    return { jwt };
  }

  async createJwt() {
    return 'jwtstring';
  }

  logout(): string {
    throw new NotImplementedException('');
  }

  revokeToken(): string {
    throw new NotImplementedException('');
  }

  refreshToken(): string {
    throw new NotImplementedException('');
  }

  getUser(): User {
    throw new NotImplementedException('');
  }

  async getOauthClient(): Promise<void> {}
}
