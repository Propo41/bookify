import { HttpStatus } from '@nestjs/common';

type StatusTypes = 'success' | 'error';

export interface ApiResponse<T> {
  status: StatusTypes;
  statusCode?: HttpStatus;
  message?: string;
  data: T;
}
