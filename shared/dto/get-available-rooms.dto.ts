import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsTimeZone,
} from 'class-validator';

export class GetAvailableRoomsQueryDto {
  @IsDateString()
  startTime: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  duration: number;

  @IsTimeZone()
  timeZone: string;

  @Transform(({ value }) => Number(value))
  seats: number;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}
