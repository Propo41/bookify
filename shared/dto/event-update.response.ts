import { EventResponse } from './event.response';

export interface EventUpdateResponse
  extends Pick<EventResponse, 'start' | 'end' | 'seats' | 'room'> {}
