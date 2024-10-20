import { IsString, IsNumber } from "class-validator";

export class UpdateEventDurationDto {
  @IsString()
  eventId: string;

  @IsString()
  roomId: string;

  @IsNumber()
  duration: number;
}
