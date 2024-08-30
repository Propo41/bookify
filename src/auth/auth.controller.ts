import { OAuth2Client } from 'google-auth-library';
import { Body, Controller, Get, NotImplementedException, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto';
import { AuthGuard } from './auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/oauth2callback')
  oAuthCallback(@Body('code') code: string): Promise<LoginResponse> {
    return this.authService.login(code);
  }

  @UseGuards(AuthGuard)
  @Get()
  async logout(@Body('oauth2Client') oauth2Client: OAuth2Client): Promise<boolean> {
    return await this.authService.logout(oauth2Client);
  }
}
