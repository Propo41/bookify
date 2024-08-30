import { OAuth2Client } from 'google-auth-library';
import { Inject, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { google } from 'googleapis';
import path from 'path';
import appConfig from 'src/config/env/app.config';

@Injectable()
export class CalenderService {
  constructor(@Inject(appConfig.KEY) private config: ConfigType<typeof appConfig>) {}

  async createEvent(): Promise<void> {
    var event = {
      summary: 'Google I/O 2015',
      location: 'Ada Bit 01',
      description: "A chance to hear more about Google's developer products.",
      start: {
        dateTime: '2024-08-28T12:00:00+06:00',
        timeZone: 'Asia/Dhaka',
      },
      end: {
        dateTime: '2024-08-28T12:30:00+06:00',
        timeZone: 'Asia/Dhaka',
      },
      attendees: [{ email: 'zahidur@cefalo.com' }, { email: 'c_188347ajd5s48glcjbcbguetd8ls4@resource.calendar.google.com' }],
      colorId: '4',
    };

    const oauth2Client = new google.auth.OAuth2(this.config.oAuthClientId, this.config.oAuthClientSecret, 'http://localhost:8000');
    const tokens = {}; // fetch from db
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...event,
      },
    });

    console.log(result);
  }

  async listRooms(client: OAuth2Client): Promise<any[]> {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
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
