import { Injectable } from '@nestjs/common';
import { IGoogleApiService } from './interfaces/google-api.interface';
import { OAuth2Client } from 'google-auth-library';
import { oauth2_v2, calendar_v3, admin_directory_v1 } from 'googleapis';
import { OAuthTokenResponse } from 'src/auth/dto/oauth-token.response';
import { User } from 'src/auth/entities';

@Injectable()
export class GoogleApiMockService implements IGoogleApiService {
  getOAuthClient(redirectUrl: string): OAuth2Client;
  getOAuthClient(redirectUrl: string, user?: User): OAuth2Client;
  getOAuthClient(redirectUrl: unknown, user?: unknown): import('google-auth-library').OAuth2Client {
    throw new Error('Method not implemented.');
  }

  getToken(oauth2Client: OAuth2Client, code: string): Promise<OAuthTokenResponse> {
    throw new Error('Method not implemented.');
  }

  getUserInfo(oauth2Client: OAuth2Client): Promise<oauth2_v2.Schema$Userinfo> {
    throw new Error('Method not implemented.');
  }

  createCalenderEvent(oauth2Client: OAuth2Client, event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    throw new Error('Method not implemented.');
  }

  getCalendarResources(oauth2Client: OAuth2Client): Promise<admin_directory_v1.Schema$CalendarResources> {
    throw new Error('Method not implemented.');
  }

  getCalenderSchedule(oauth2Client: OAuth2Client, start: string, end: string, timeZone: string, rooms: string[]): Promise<calendar_v3.Schema$FreeBusyCalendar> {
    throw new Error('Method not implemented.');
  }

  getCalenderEvents(oauth2Client: OAuth2Client, start: string, end: string, timeZone: string, limit?: number): Promise<calendar_v3.Schema$Event[]> {
    throw new Error('Method not implemented.');
  }

  getCalenderEvent(oauth2Client: OAuth2Client, id: string): Promise<calendar_v3.Schema$Event> {
    throw new Error('Method not implemented.');
  }

  updateCalenderEvent(oauth2Client: OAuth2Client, id: string, event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    throw new Error('Method not implemented.');
  }

  deleteEvent(oauth2Client: OAuth2Client, id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
