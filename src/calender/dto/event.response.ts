import { ConferenceRoom } from '../../auth/entities';

export interface EventResponse {
  eventId?: string;
  status?: boolean;
  statusMessage?: string;
  summary?: string;
  room?: string;
  start?: string;
  end?: string;
  meet?: string;
  roomEmail?: string;
  roomId?: string;
  seats?: number;
  availableRooms?: ConferenceRoom[];
}
