import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { User } from './entities';
import { google } from 'googleapis';
import appConfig from 'src/config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { LoginResponse } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
  ) {}

  async login(code: string): Promise<LoginResponse> {
    const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, 'http://localhost:8000');

    const { tokens } = await oauth2Client.getToken(code);
    // {
    //   access_token: "",
    //   scope: "https://www.googleapis.com/auth/calendar",p
    //   token_type: "Bearer",
    //   expiry_date: 1724919967711,
    // }
    // save tokens to database
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const userInfo = await oauth2.userinfo.get();
    // {
    //   id: "118396694939616033579",
    //   email: "ali.ahnaf@cefalo.com",
    //   verified_email: true,
    //   name: "Ali Ahnaf",
    //   given_name: "Ali",
    //   family_name: "Ahnaf",
    //   picture: "https://lh3.googleusercontent.com/a/ACg8ocJhx6Bwsd-7UqQ01FcHxVoaFijO9kTqaJGNg4d8K-x4XCBOPxzn=s96-c",
    //   hd: "cefalo.com",
    // }

    console.log(userInfo.data);

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
