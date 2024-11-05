import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '@quickmeet/shared';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const validationResponse = exception.getResponse();
    const errorResponse: ErrorResponse = {
      statusCode: status,
      status: 'error',
      message: exception.message,
    };

    if (typeof validationResponse === 'object' && 'message' in validationResponse) {
      errorResponse.error = (validationResponse as any).message;
    }

    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        errorResponse.redirect = true;
        break;
    }

    response.status(status).json(errorResponse);
  }
}
