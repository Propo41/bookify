import { IsDateString, IsTimeZone } from "class-validator";

export class ListRoomsQueryDto {
  @IsDateString()
  startTime: string;
  
  @IsDateString()
  endTime: string;

  @IsTimeZone()
  timeZone: string;
}
