import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import appConfig from '../config/env/app.config';
import { Request } from 'express';
import { IJwtPayload } from './dto';
import { AuthService } from './auth.service';
import to from 'await-to-js';

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

    const [err, payload]: [Error, IJwtPayload] = await to(
      this.jwtService.verifyAsync(token, {
        secret: this.config.jwtSecret,
      }),
    );

    if (err) {
      console.error(err);
      throw new UnauthorizedException('Invalid or expired token');
    }

    let user = await this.authService.getUser(payload.sub);
    request['user'] = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
