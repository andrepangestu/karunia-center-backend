import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errors } = this.normalize(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      message,
      errors,
    });
  }

  private normalize(exception: unknown): {
    status: number;
    message: string;
    errors: Record<string, string[]> | null;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status, message: payload, errors: null };
      }

      const body = payload as {
        message?: string | string[];
        errors?: Record<string, string[]>;
      };

      if (body.errors) {
        return {
          status,
          message:
            typeof body.message === 'string'
              ? body.message
              : 'Validation failed',
          errors: body.errors,
        };
      }

      if (Array.isArray(body.message)) {
        return {
          status,
          message: 'Validation failed',
          errors: { general: body.message },
        };
      }

      return {
        status,
        message: body.message ?? exception.message,
        errors: null,
      };
    }

    if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as { code?: string };
      if (driverError?.code === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          errors: null,
        };
      }
      if (driverError?.code === '23503') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Resource is still referenced by related records',
          errors: null,
        };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: null,
    };
  }
}
