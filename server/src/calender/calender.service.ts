import { OAuth2Client } from 'google-auth-library';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { calendar_v3 } from 'googleapis';
import appConfig from '../config/env/app.config';
import { extractRoomName, isRoomAvailable, toMs, validateEmail } from './util/calender.util';
import { AuthService } from '../auth/auth.service';
import { ConferenceRoom } from '../auth/entities';
import { ApiResponse, DeleteResponse, EventResponse, EventUpdateResponse } from '@bookify/shared';
import { createResponse } from '../helpers/payload.util';
import { IGoogleApiService } from '../google-api/interfaces/google-api.interface';

@Injectable()
export class CalenderService {
  constructor(
    @Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>,
    private authService: AuthService,
    @Inject('IGoogleApiService') private readonly googleApiService: IGoogleApiService,
  ) {}

  async createEvent(
    client: OAuth2Client,
    domain: string,
    startTime: string,
    endTime: string,
    seats: number,
    timeZone: string,
    createConference?: boolean,
    eventTitle?: string,
    floor?: string,
    attendees?: string[],
  ): Promise<ApiResponse<EventResponse>> {
    const rooms: ConferenceRoom[] = await this.getAvailableRooms(client, domain, startTime, endTime, seats, timeZone, floor);
    if (!rooms?.length) {
      throw new ConflictException('No room available within specified time range');
    }

    const attendeeList = [];
    if (attendees?.length) {
      for (const attendee of attendees) {
        if (validateEmail(attendee)) {
          attendeeList.push({ email: attendee });
        } else {
          throw new BadRequestException('Invalid attendee email provided: ' + attendee);
        }
      }
    }

    let conference = {};
    if (createConference) {
      conference = {
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };
    }

    // room.seat should be as closer to user's preferred minSeat value
    const pickedRoom = rooms[0];
    var event: calendar_v3.Schema$Event = {
      summary: eventTitle?.trim() || 'Quick Meeting | Bookify',
      location: pickedRoom.name,
      description: 'A quick meeting created by Bookify',
      start: {
        dateTime: startTime,
      },
      end: {
        dateTime: endTime,
      },
      attendees: [...attendeeList, { email: pickedRoom.email }],
      colorId: '3',
      ...conference,
    };

    const createdEvent = await this.googleApiService.createCalenderEvent(client, event);

    const room = extractRoomName(rooms, createdEvent.location);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    console.log('Room has been booked', createdEvent);

    const data: EventResponse = {
      eventId: createdEvent.id,
      summary: createdEvent.summary,
      meet: createdEvent.hangoutLink,
      start: createdEvent.start.dateTime,
      end: createdEvent.end.dateTime,
      room: room,
      roomEmail: pickedRoom.email,
      roomId: pickedRoom.id,
      seats: pickedRoom.seats,
      availableRooms: rooms,
    };

    return createResponse(data, 'Room has been booked');
  }

  async getAvailableRooms(
    client: OAuth2Client,
    domain: string,
    start: string,
    end: string,
    minSeats: number,
    timeZone: string,
    floor?: string,
  ): Promise<ConferenceRoom[]> {
    const filteredRoomEmails: string[] = [];
    const rooms = await this.authService.getCalenderResources(domain);

    for (const room of rooms) {
      if (room.seats >= minSeats && room.floor === floor) {
        filteredRoomEmails.push(room.email);
      }
    }

    const calenders = await this.googleApiService.getCalenderSchedule(client, start, end, timeZone, filteredRoomEmails);

    const availableRooms: ConferenceRoom[] = [];
    let room: ConferenceRoom = null;

    for (const roomEmail of Object.keys(calenders)) {
      const isAvailable = isRoomAvailable(calenders[roomEmail].busy, new Date(start), new Date(end));
      if (isAvailable) {
        room = rooms.find((room) => room.email === roomEmail);
        availableRooms.push(room);
      }
    }

    return availableRooms;
  }

  async isRoomAvailable(client: OAuth2Client, start: string, end: string, roomEmail: string, timeZone?: string): Promise<boolean> {
    const calenders = await this.googleApiService.getCalenderSchedule(client, start, end, timeZone, [roomEmail]);

    const availableRooms: ConferenceRoom[] = [];
    let room: ConferenceRoom = null;

    for (const roomEmail of Object.keys(calenders)) {
      const isAvailable = isRoomAvailable(calenders[roomEmail].busy, new Date(start), new Date(end));
      if (isAvailable) {
        availableRooms.push(room);
      }
    }

    if (availableRooms.length === 0) {
      return false;
    }

    return true;
  }

  async listRooms(client: OAuth2Client, domain: string, startTime: string, endTime: string, timeZone: string): Promise<ApiResponse<EventResponse[]>> {
    const rooms = await this.authService.getCalenderResources(domain);
    const events = await this.googleApiService.getCalenderEvents(client, startTime, endTime, timeZone);

    const formattedEvents = events.map((event) => {
      let room: ConferenceRoom = rooms.find((_room) => event.location.includes(_room.name));

      const _event: EventResponse = {
        meet: event.hangoutLink ? event.hangoutLink.split('/').pop() : undefined,
        room: room.name,
        roomEmail: room.email,
        eventId: event.id,
        seats: room.seats,
        floor: room.floor,
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
      };

      return _event;
    });

    return createResponse(formattedEvents);
  }

  async updateEventRoom(client: OAuth2Client, domain: string, eventId: string, roomEmail: string): Promise<ApiResponse<EventUpdateResponse>> {
    const event = await this.googleApiService.getCalenderEvent(client, eventId);
    const rooms: ConferenceRoom[] = await this.authService.getCalenderResources(domain);
    const room = rooms.find((room) => room.email === roomEmail);
    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    // check if room is available
    const availableRooms: ConferenceRoom[] = await this.getAvailableRooms(
      client,
      domain,
      event.start.dateTime,
      event.end.dateTime,
      room.seats,
      event.start.timeZone,
      room.floor,
    );

    const isFree = !!availableRooms.find((room) => room.email === roomEmail);
    if (!isFree) {
      const data: EventResponse = { availableRooms };
      return createResponse(data, 'Selected room is not available at the moment');
    }

    // remove the previous room id from the list
    const filteredAttendees = event.attendees.filter((attendee) => !attendee.email.endsWith('@resource.calendar.google.com'));

    const updatedEvent: calendar_v3.Schema$Event = {
      ...event,
      location: room.name,
      attendees: [...filteredAttendees, { email: roomEmail }],
    };

    const result = await this.googleApiService.updateCalenderEvent(client, eventId, updatedEvent);

    console.log('Room has been updated', result);

    const roomName = extractRoomName(rooms, result.location);
    if (!roomName) {
      throw new BadRequestException('Room not found');
    }
    const data: EventResponse = {
      seats: room.seats,
      room: roomName,
    };

    return createResponse(data, 'Selected room is not available at the moment');
  }

  async updateEventDuration(client: OAuth2Client, eventId: string, roomId: string, duration: number): Promise<ApiResponse<EventUpdateResponse>> {
    const event = await this.googleApiService.getCalenderEvent(client, eventId);

    const { start, end } = event;

    // start time
    const startMs = new Date(start.dateTime).getTime();

    // end time
    const endMs = new Date(end.dateTime).getTime();

    const newDurationInMs = toMs(duration);
    const eventDurationInMs = endMs - startMs;

    let newEnd: string;

    if (newDurationInMs === eventDurationInMs) {
      throw new BadRequestException('Duration has already been set to ' + duration + ' mins');
    } else if (newDurationInMs < eventDurationInMs && newDurationInMs >= toMs(15)) {
      newEnd = new Date(endMs - (eventDurationInMs - newDurationInMs)).toISOString();
    } else {
      const newStart = end.dateTime;
      newEnd = new Date(endMs + (newDurationInMs - eventDurationInMs)).toISOString();

      // check if room is available within newStart and newEnd
      const isAvailable = await this.isRoomAvailable(client, newStart, newEnd, roomId, start.timeZone);
      if (!isAvailable) {
        throw new ForbiddenException('Room is not available within time range');
      }
    }

    // update the room
    const newEvent: calendar_v3.Schema$Event = {
      ...event,
      end: {
        dateTime: newEnd,
        timeZone: end.timeZone,
      },
    };

    const result = await this.googleApiService.updateCalenderEvent(client, eventId, newEvent);

    const data: EventUpdateResponse = {
      start: result.start.dateTime,
      end: result.end.dateTime,
    };

    return createResponse(data, 'Room has been updated');
  }

  async deleteEvent(client: OAuth2Client, id: string): Promise<ApiResponse<DeleteResponse>> {
    await this.googleApiService.deleteEvent(client, id);

    const data: DeleteResponse = {
      deleted: true,
    };

    return createResponse(data, 'Event deleted');
  }

  async listFloors(domain: string): Promise<ApiResponse<string[]>> {
    const floors = await this.authService.getFloorsByDomain(domain);
    return createResponse(floors);
  }
}
