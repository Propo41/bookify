import { ApiResponse } from './api.response';

export interface ErrorResponse extends Omit<ApiResponse<never>, 'data'> {
  error?: string | object;
}
