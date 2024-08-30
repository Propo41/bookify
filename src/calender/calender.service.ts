import { OAuth2Client } from 'google-auth-library';
import { Inject, Injectable, InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import appConfig from '../config/env/app.config';
import { EventResponse } from './dto';
import { rooms } from '../config/rooms';
import { isRoomAvailable } from './util/calender.util';
import { Room } from './interfaces/room.interface';

@Injectable()
export class CalenderService {
  constructor(@Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>) {}

  async createEvent(
    client: OAuth2Client,
    startTime: string,
    endTime: string,
    seats: number,
    eventTitle?: string,
    floor?: number,
    attendees?: string[],
  ): Promise<EventResponse | null> {
    const room = await this.getAvailableRoom(client, startTime, endTime, seats, floor);

    if (!room) {
      console.error('No room available within specified time range');
      return null;
    }

    let attendeeList = [];
    if (attendees) {
      attendeeList = attendees?.map((attendee) => {
        return { email: attendee };
      });
    }
    var event = {
      summary: eventTitle || 'Quick Meeting',
      location: room.name,
      description: 'A quick meeting',
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Dhaka',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Dhaka',
      },
      attendees: [...attendeeList, { email: room.id }],
      colorId: '3',
    };

    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...event,
      },
    });

    if (result.status !== 200) {
      throw new InternalServerErrorException("Couldn't book room. Please try again later.");
    }

    return {
      summary: result.data.summary,
      meet: result.data.hangoutLink,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      room: result.data.location,
    };
  }

  async getAvailableRoom(client: OAuth2Client, start: string, end: string, seats: number, floor?: number): Promise<Room> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: client });
      const filteredRoomIds = [];
      for (const room of rooms) {
        if (room.seats === seats && (!floor || room.floor === floor)) {
          filteredRoomIds.push(room.id);
        }
      }

      const availableRooms = await calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          timeZone: 'Asia/Dhaka',
          items: rooms.map((room) => {
            return {
              id: room.id,
            };
          }),
        },
      });

      const calenders = availableRooms.data.calendars;
      for (const roomId of Object.keys(calenders)) {
        const isAvailable = isRoomAvailable(calenders[roomId].busy, new Date(start), new Date(end));
        if (isAvailable) {
          return rooms.find((room) => room.id === roomId);
        }
      }
    } catch (error) {
      console.log(error);
    }

    return null;
  }

  async listRooms(client: OAuth2Client): Promise<any[]> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = result.data.items;
    return events;
  }

  listEvents(): string {
    throw new NotImplementedException('');
  }

  updateEvent(): string {
    throw new NotImplementedException('');
  }

  deleteEvent(): string {
    throw new NotImplementedException('');
  }
}
