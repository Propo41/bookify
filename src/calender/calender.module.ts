import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CalenderController } from './calender.controller';
import { CalenderService } from './calender.service';

@Module({
  imports: [AuthModule],
  controllers: [CalenderController],
  exports: [CalenderService],
  providers: [CalenderService, CalenderService],
})
export class CalenderModule {}
