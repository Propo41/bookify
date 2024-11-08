import { HttpStatus } from '@nestjs/common';
import { ApiResponse, StatusTypes } from '@quickmeet/shared';

export const createResponse = <T>(
  data: T,
  message: string = 'Request successful',
  status: StatusTypes = 'success',
  statusCode: HttpStatus = HttpStatus.OK,
): ApiResponse<T> => {
  return {
    status,
    statusCode,
    message,
    data,
  };
};
