import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import appConfig from 'src/config/env/app.config';
import { Request } from 'express';
import { IJwtPayload } from './dto';
import { AuthService } from './auth.service';
import { google } from 'googleapis';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: IJwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.config.jwtSecret,
      });

      const user = await this.authService.getUser(payload.sub);

      // TODO: move this to a middleware
      const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, this.config.oAuthRedirectUrl);
      const { accessToken, scope, tokenType, expiryDate } = user.auth;

      oauth2Client.setCredentials({
        access_token: accessToken,
        scope: scope,
        token_type: tokenType,
        expiry_date: expiryDate,
      });

      request['user'] = user;
      request['oauth2Client'] = oauth2Client;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
