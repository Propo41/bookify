import { Injectable } from '@nestjs/common';
import { IGoogleApiService } from './interfaces/google-api.interface';

@Injectable()
export class GoogleApiMockService implements IGoogleApiService {
  async getCalendarEvents(): Promise<any> {
    return {
      data: {
        items: [
          { summary: 'Test Event 1', start: { dateTime: '2024-09-01T10:00:00Z' } },
          { summary: 'Test Event 2', start: { dateTime: '2024-09-02T11:00:00Z' } },
        ],
      },
    };
  }

  async getAuthToken(): Promise<any> {
    // Mocked response for testing
    return { access_token: 'mock_access_token', refresh_token: 'mock_refresh_token' };
  }
}
