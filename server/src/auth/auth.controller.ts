import { ApiResponse, LoginResponse } from '@bookify/shared';
import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Get, Headers, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { _OAuth2Client } from './decorators';
import { OAuthInterceptor } from './oauth.interceptor';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/oauth2callback')
  async oAuthCallback(@Body('code') code: string, @Headers('x-redirect-url') redirectUrl: string): Promise<ApiResponse<LoginResponse>> {
    return await this.authService.login(code, redirectUrl);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(OAuthInterceptor)
  @Post('/logout')
  async logout(@_OAuth2Client() client: OAuth2Client): Promise<ApiResponse<boolean>> {
    return await this.authService.logout(client);
  }

  @UseGuards(AuthGuard)
  @Get('/session')
  validateSession(): Promise<ApiResponse<boolean>> {
    return this.authService.validateSession();
  }
}
