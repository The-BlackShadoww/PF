import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.requestId ?? 'unknown';
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = this.extractMessage(exceptionResponse);

      response.status(statusCode).json({
        statusCode,
        message,
        requestId,
        timestamp,
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.message : 'Unknown error',
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      requestId,
      timestamp,
    });
  }

  private extractMessage(
    exceptionResponse: string | object,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const response = exceptionResponse as { message?: string | string[] };
    if (Array.isArray(response.message)) {
      return response.message;
    }
    if (typeof response.message === 'string') {
      return response.message;
    }

    return 'An error occurred';
  }
}
