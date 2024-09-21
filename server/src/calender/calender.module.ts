import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CalenderController } from './calender.controller';
import { CalenderService } from './calender.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AuthModule],
  controllers: [CalenderController],
  exports: [CalenderService],
  providers: [CalenderService, JwtService],
})
export class CalenderModule {}
