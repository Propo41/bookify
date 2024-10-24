import { IsOptional, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class BookRoomDto {
  @IsString()
  startTime: string; // A combined date-time value (formatted according to RFC3339A). Time zone offset is required

  @IsNumber()
  duration: number;

  @IsNumber()
  seats: number;

  @IsString()
  timeZone: string; // todo: mark it optional

  @IsString()
  room: string;

  @IsOptional()
  @IsBoolean()
  createConference?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];
}
