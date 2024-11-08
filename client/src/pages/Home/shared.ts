import { DropdownOption } from '@components/Dropdown';
import { populateDurationOptions, populateRoomCapacity, populateTimeOptions } from '@helpers/utility';

export interface Event {
  room?: string;
  eventId?: string;
  start?: string;
  end?: string;
  summary?: string;
  availableRooms?: DropdownOption[];
  roomEmail?: string;
  seats?: number;
  isEditable?: boolean;
  createdAt?: number;
}

export const availableDurations = populateDurationOptions(30, 3 * 60); // 30 mins -> 5 hrs
export const availableRoomCapacities = populateRoomCapacity(); // TODO: fetch from database
export const availableStartTimeOptions = populateTimeOptions();
