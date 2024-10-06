import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '@bookify/shared';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      status: 'error',
      message: exception.message,
    };

    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        errorResponse.redirect = true;
        break;
    }

    response.status(status).json(errorResponse);
  }
}
