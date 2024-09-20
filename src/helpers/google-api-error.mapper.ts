import { GaxiosError } from 'gaxios';
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  ServiceUnavailableException,
  HttpException,
} from '@nestjs/common';

export class CalendarAPIErrorMapper {
  static handleError(err: GaxiosError, callback?: () => void): void {
    if (!err.response) {
      throw new InternalServerErrorException('Network error or no response received');
    }

    const { status, statusText, data } = err.response;

    switch (status) {
      case 400:
        throw new BadRequestException(`Bad Request: ${statusText}. Details: ${data?.error?.message || 'Invalid parameters or request body'}`);
      case 401:
        throw new UnauthorizedException(`Unauthorized: ${statusText}. You might need to refresh your credentials.`);
      case 403:
        callback();
        throw new ForbiddenException(`Forbidden: ${statusText}. Access is denied`);
      case 404:
        throw new NotFoundException(`Not Found: ${statusText}. Resource might not exist.`);
      case 429:
        throw new HttpException(`Too Many Requests: ${statusText}. You've exceeded the rate limit.`, status);
      case 500:
        throw new InternalServerErrorException(`Internal Server Error: ${statusText}. Please try again later.`);
      case 503:
        throw new ServiceUnavailableException(`Service Unavailable: ${statusText}. The server is currently unavailable.`);
      default:
        throw new HttpException(`Error: ${statusText}. Details: ${data?.error?.message || 'An unknown error occurred'}`, status);
    }
  }
}
