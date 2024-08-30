import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto';
import { AuthGuard } from './auth.guard';
import { _OAuth2Client } from './decorators';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/oauth2callback')
  oAuthCallback(@Body('code') code: string): Promise<LoginResponse> {
    return this.authService.login(code);
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(@_OAuth2Client() client: OAuth2Client): Promise<boolean> {
    return await this.authService.logout(client);
  }
}
