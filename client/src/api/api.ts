import { ApiResponse, BookRoomDto, DeleteResponse, ErrorResponse, EventResponse, EventUpdateResponse, LoginResponse } from '@bookify/shared';
import axios, { AxiosError, AxiosInstance, RawAxiosRequestHeaders } from 'axios';
import { toast } from 'react-hot-toast';
import { secrets } from '../config/secrets';
import { CacheService, CacheServiceFactory } from '../helpers/cache';

export const SCOPES = [
  'https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * @description Serves as the base API endpoint for the application. It provides the authorization token in every request
 */
export default class Api {
  apiToken?: string;
  apiEndpoint?: string = secrets.backendEndpoint;
  client: AxiosInstance;
  cacheService: CacheService = CacheServiceFactory.getCacheService();

  constructor() {
    this.client = axios.create({
      baseURL: `${this.apiEndpoint}`,
      timeout: secrets.nodeEnvironment === 'development' ? 1000000 : 10000,
    });
  }

  async handleOAuthCallback(code: string) {
    try {
      const payload = {
        code,
      };

      const res: ApiResponse<LoginResponse> = await this.client.post('/oauth2callback', payload, {
        headers: this.getHeaders(),
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async logout() {
    try {
      const res: ApiResponse<boolean> = await this.client.post('/logout', {
        headers: this.getHeaders(),
      });

      await this.cacheService.remove('access_token');
      await this.cacheService.remove('floors');
      await this.cacheService.remove('floor');

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async loginChrome() {
    const scopes = SCOPES.join(' ').trim();
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${secrets.clientId}&redirect_uri=${secrets.oAuthRedirectUrl}&response_type=code&scope=${scopes}&access_type=offline`;
    console.log('secrets.oAuthRedirectUrl', secrets.oAuthRedirectUrl);

    return this.handleChromeOauthFlow(authUrl);
  }

  async login() {
    const scopes = SCOPES.join(' ').trim();
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${secrets.clientId}&redirect_uri=${secrets.oAuthRedirectUrl}&response_type=code&scope=${scopes}&access_type=offline`;

    window.location.href = authUrl;
  }

  async handleChromeOauthFlow(authUrl: string) {
    const res = await new Promise<ApiResponse<any>>((resolve, _) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            toast.error("Couldn't complete the OAuth flow");
            console.error(chrome.runtime.lastError);
          } else {
            console.log('Redirect URL:', redirectUrl);
            const url = new URL(redirectUrl);

            const code = url.searchParams.get('code');
            console.log(code);

            try {
              if (code) {
                const res = await this.handleOAuthCallback(code);
                if (!res) return;

                const { status, message, data } = res;
                if (status === 'error') {
                  return resolve({
                    message: message || 'Something went wrong',
                    redirect: true,
                    status: 'success',
                  });
                }

                resolve({
                  status: 'success',
                  data: data?.accessToken,
                });
              }
            } catch (error: any) {
              resolve({
                status: 'error',
                redirect: true,
                message: error.message,
              });
            }

            resolve({
              status: 'error',
              redirect: true,
              message: 'Something went wrong',
            });
          }
        },
      );
    });

    return res;
  }

  getHeaders(): Partial<RawAxiosRequestHeaders> {
    const token = this.cacheService.get('access_token');
    return {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Redirect-Url': secrets.oAuthRedirectUrl,
    };
  }

  async getRooms(startTime: string, endTime: string, timeZone: string) {
    try {
      const res: ApiResponse<EventResponse[]> = await this.client.get('/rooms', {
        headers: this.getHeaders(),
        params: {
          startTime,
          endTime,
          timeZone,
        },
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createRoom(payload: BookRoomDto) {
    try {
      const res: ApiResponse<EventResponse> = await this.client.post('/rooms', payload, {
        headers: this.getHeaders(),
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateRoomId(eventId: string, roomId: string, requestedAt: Date) {
    try {
      const data = { eventId, roomId, requestedAt };
      const res: ApiResponse<EventUpdateResponse> = await this.client.put('/room/id', data, {
        headers: this.getHeaders(),
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateRoomDuration(eventId: string, roomId: string, duration: number) {
    try {
      const data = { eventId, roomId, duration };
      const res: ApiResponse<EventUpdateResponse> = await this.client.put('/room/duration', data, {
        headers: this.getHeaders(),
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteRoom(roomId: string) {
    try {
      const res: ApiResponse<DeleteResponse> = await this.client.put(`/room?id=${roomId}`, {
        headers: this.getHeaders(),
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getFloors() {
    try {
      const res: ApiResponse<string[]> = await this.client.get('/floors', {
        headers: this.getHeaders(),
      });

      return res;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  handleError(error: any) {
    console.error(error);
    const res: ApiResponse<any> = error?.response?.data;
    if (res) {
      return res;
    }

    if (error?.message) {
      return {
        status: 'error',
        message: 'Something went wrong',
        data: null,
      } as ApiResponse<any>;
    }
  }
}
