import { ConferenceRoom } from '../../auth/entities';

export interface EventResponse {
  summary?: string;
  room?: string;
  start?: string;
  end?: string;
  meet?: string;
  roomId?: string;
  availableRooms?: ConferenceRoom[];
}
