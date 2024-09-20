import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import appConfig from 'src/config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { User } from './entities';
import { google } from 'googleapis';

@Injectable()
export class OAuthInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: User = request['user'];
    const redirectUrl = request.headers['x-redirect-url'];

    let oauth2Client = this.createOauthClient(user, redirectUrl);

    try {
      const currentTime = new Date().getTime();
      // todo google automatically refreshes token if client contains refresh token?
      // if (currentTime > user.auth.expiryDate) {
      //   const { accessToken, expiryDate } = await this.authService.refreshToken(user, oauth2Client);

      //   user.auth.accessToken = accessToken;
      //   user.auth.expiryDate = expiryDate;

      //   oauth2Client = this.createOauthClient(user, redirectUrl);
      // }

      request['oauth2Client'] = oauth2Client;
    } catch (err) {
      console.error(err);
      await this.authService.purgeAccess(oauth2Client);
      throw new UnauthorizedException(err.message);
    }

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
