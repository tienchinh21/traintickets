import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';

type ErrorResponseBody = {
  code?: string;
  message?: string | string[];
  details?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponseBody)
        : undefined;

    const message = Array.isArray(body?.message)
      ? 'Dữ liệu không hợp lệ'
      : (body?.message ?? 'Lỗi hệ thống');

    response.status(status).json({
      success: false,
      error: {
        code: body?.code ?? this.resolveErrorCode(status),
        message,
        details:
          body?.details ?? (Array.isArray(body?.message) ? body.message : [])
      }
    });
  }

  private resolveErrorCode(status: HttpStatus) {
    if (status === HttpStatus.BAD_REQUEST) {
      return 'VALIDATION_ERROR';
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      return 'UNAUTHORIZED';
    }

    if (status === HttpStatus.FORBIDDEN) {
      return 'FORBIDDEN';
    }

    if (status === HttpStatus.NOT_FOUND) {
      return 'NOT_FOUND';
    }

    return 'INTERNAL_SERVER_ERROR';
  }
}
