import { Room } from '../interfaces/room.interface';

export interface EventResponse {
  summary?: string;
  room?: string;
  start?: string;
  end?: string;
  meet?: string;
  roomId?: string;
  availableRooms?: Room[];
}
