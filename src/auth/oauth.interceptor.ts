import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import appConfig from 'src/config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { User } from './entities';
import { google } from 'googleapis';

@Injectable()
export class OAuthInterceptor implements NestInterceptor {
  constructor(@Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: User = request['user'];
    const redirectUrl = request.headers['x-redirect-url'];

    let oauth2Client = this.createOauthClient(user, redirectUrl);
    request['oauth2Client'] = oauth2Client;

    return next.handle();
  }

  private createOauthClient(user: User, redirectUrl: string) {
    const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, redirectUrl);
    const { accessToken, scope, tokenType, expiryDate, idToken, refreshToken } = user.auth;

    oauth2Client.setCredentials({
      access_token: accessToken,
      scope: scope,
      token_type: tokenType,
      expiry_date: expiryDate,
      id_token: idToken,
      refresh_token: refreshToken,
    });

    return oauth2Client;
  }
}
