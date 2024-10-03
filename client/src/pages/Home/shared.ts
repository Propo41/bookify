import { DropdownOption } from '../../components/Dropdown';

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
