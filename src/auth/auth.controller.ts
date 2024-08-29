import { Body, Controller, Get, NotImplementedException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/oauth2callback')
  oAuthCallback(@Body('code') code: string): Promise<LoginResponse> {
    return this.authService.login(code);
  }

  @Get()
  logout(): Promise<void> {
    throw new NotImplementedException('');
  }
}
