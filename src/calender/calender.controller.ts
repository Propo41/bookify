import { Controller, Get } from '@nestjs/common';
import { CalenderService } from './calender.service';

@Controller()
export class CalenderController {
  constructor(private readonly calenderService: CalenderService) {}

  @Get()
  listRooms(): string {
    return this.calenderService.listRooms();
  }
}
