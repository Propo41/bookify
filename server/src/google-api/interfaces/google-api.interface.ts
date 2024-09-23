export interface IGoogleApiService {
  getCalendarEvents(): Promise<any>;
  getAuthToken(): Promise<any>;
}
