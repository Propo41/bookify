export interface ConferenceRoom {
  id?: string;
  domain?: string;
  name?: string;
  email?: string;
  seats?: number;
  description?: string;
  floor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormData {
  startTime: string;
  duration: number;
  seats: number;
  floor: string;
  title?: string;
  attendees?: string[];
  conference?: boolean;
}

export interface EventResponse {
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
  floor?: string;
  availableRooms?: ConferenceRoom[];
}

export interface RoomResponse {
  conference?: string;
  room?: string;
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  seats?: number;
  floor?: string;
}
