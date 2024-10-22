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

  @IsNumber()
  duration: number;

  @IsTimeZone()
  timeZone: string;

  @IsNumber()
  seats: number;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  eventId: string;
}
