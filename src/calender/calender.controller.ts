import { OAuth2Client } from 'google-auth-library';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { AuthGuard } from '../auth/auth.guard';
import { _OAuth2Client } from '../auth/decorators';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @UseGuards(AuthGuard)
  @Get('/rooms')
  async listRooms(@_OAuth2Client() client: OAuth2Client): Promise<any[]> {
    return this.calenderService.listRooms(client);
  }
}
