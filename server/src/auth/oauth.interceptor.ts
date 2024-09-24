import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import appConfig from 'src/config/env/app.config';
import { ConfigType } from '@nestjs/config';
import { User } from './entities';
import { IGoogleApiService } from '../google-api/interfaces/google-api.interface';

@Injectable()
export class OAuthInterceptor implements NestInterceptor {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    @Inject('IGoogleApiService') private readonly googleApiService: IGoogleApiService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: User = request['user'];
    const redirectUrl = request.headers['x-redirect-url'];

    let oauth2Client = this.createOauthClient(user, redirectUrl);
    request['oauth2Client'] = oauth2Client;

    console.log(user, oauth2Client);

    return next.handle();
  }

  private createOauthClient(user: User, redirectUrl: string) {
    return this.googleApiService.getOAuthClient(redirectUrl, user);
  }
}
