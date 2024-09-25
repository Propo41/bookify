import { Injectable } from '@nestjs/common';
import { IGoogleApiService } from './interfaces/google-api.interface';
import { OAuth2Client } from 'google-auth-library';
import { oauth2_v2, calendar_v3, admin_directory_v1 } from 'googleapis';
import { OAuthTokenResponse } from '../auth/dto/oauth-token.response';
import { User } from '../auth/entities';
import { CalenderMockDb } from './mock.database';

@Injectable()
export class GoogleApiMockService implements IGoogleApiService {
  db: CalenderMockDb;

  constructor() {
    this.db = new CalenderMockDb();
  }

  getOAuthClient(redirectUrl: string): OAuth2Client;
  getOAuthClient(redirectUrl: string, user?: User): OAuth2Client;
  getOAuthClient(redirectUrl: unknown, user?: User): OAuth2Client {
    console.log(`Mock getOAuthClient called with redirectUrl: ${redirectUrl}, user: ${user?.id}`);
    return new OAuth2Client();
  }

  getToken(oauth2Client: OAuth2Client, code: string): Promise<OAuthTokenResponse> {
    console.log(`Mock getToken called with code: ${code}`);
    const res: OAuthTokenResponse = {
      tokens: {
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
        scope: 'mockScope',
        id_token: 'mockIdToken',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600 * 1000,
      },
    };
    return Promise.resolve(res);
  }

  getUserInfo(oauth2Client: OAuth2Client): Promise<oauth2_v2.Schema$Userinfo> {
    console.log('Mock getUserInfo called');
    return Promise.resolve(this.db.getUser(0));
  }

  createCalenderEvent(oauth2Client: OAuth2Client, event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    console.log(`Mock createCalenderEvent called with event: ${event.summary}`);
    if (event.conferenceData) {
      event.hangoutLink = 'https://meet.google.com/mock-meeting-id';
    }

    return Promise.resolve(this.db.createEvent(event));
  }

  getCalendarResources(oauth2Client: OAuth2Client): Promise<admin_directory_v1.Schema$CalendarResources> {
    console.log('Mock getCalendarResources called');
    const items = this.db.getRooms();
    return Promise.resolve({
      kind: 'admin#directory#resources#calendars',
      etag: 'mockEtag',
      items: items,
    } as admin_directory_v1.Schema$CalendarResources);
  }

  async getCalenderSchedule(
    oauth2Client: OAuth2Client,
    start: string,
    end: string,
    timeZone: string,
    rooms: string[],
  ): Promise<{
    [key: string]: calendar_v3.Schema$FreeBusyCalendar;
  }> {
    console.log(`Mock getCalenderSchedule called with start: ${start}, end: ${end}, rooms: ${rooms}`);
    const busySchedule: Record<string, { busy: { start: string; end: string }[] }> = {};
    const events = this.db.listEvents();

    for (const roomEmail of rooms) {
      busySchedule[roomEmail] = { busy: [] };

      for (const event of events) {
        if (!event.attendees) continue;

        const isRoomAttendee = event.attendees.some((attendee: { email: string }) => attendee.email === roomEmail);
        if (isRoomAttendee) {
          busySchedule[roomEmail].busy.push({
            start: event.start.dateTime,
            end: event.end.dateTime,
          });
        }
      }
    }

    return Promise.resolve(
      busySchedule as {
        [key: string]: calendar_v3.Schema$FreeBusyCalendar;
      },
    );
  }

  async getCalenderEvents(oauth2Client: OAuth2Client, start: string, end: string, timeZone: string, limit = 30): Promise<calendar_v3.Schema$Event[]> {
    console.log(`Mock getCalenderEvents called with start: ${start}, end: ${end}, limit: ${limit}`);
    const events = this.db.listEvents(start, end, limit);
    return Promise.resolve(events);
  }

  async getCalenderEvent(oauth2Client: OAuth2Client, id: string): Promise<calendar_v3.Schema$Event> {
    console.log(`Mock getCalenderEvent called with id: ${id}`);
    const event = this.db.getEvent(id);
    return Promise.resolve(event);
  }

  async updateCalenderEvent(oauth2Client: OAuth2Client, id: string, event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    console.log(`Mock updateCalenderEvent called with id: ${id}, event: ${event.summary}`);
    const updatedEvent = this.db.updateEvent(id, event);
    return Promise.resolve(updatedEvent);
  }

  async deleteEvent(oauth2Client: OAuth2Client, id: string): Promise<void> {
    console.log(`Mock deleteEvent called with id: ${id}`);
    this.db.deleteEvent(id);
    return Promise.resolve();
  }
}
