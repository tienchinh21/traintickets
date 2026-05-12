import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const normalizedError = this.normalizeException(exception);

    response.status(normalizedError.status).json({
      success: false,
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
        details: normalizedError.details
      }
    });
  }

  private normalizeException(exception: unknown) {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.normalizePrismaException(exception);
    }

    if (!(exception instanceof HttpException)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message: 'Có lỗi xảy ra, vui lòng thử lại sau',
        details: []
      };
    }

    const status = exception.getStatus();
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponseBody)
        : undefined;

    const message = Array.isArray(body?.message)
      ? 'Dữ liệu không hợp lệ'
      : (body?.message ?? this.resolveErrorMessage(status));

    return {
      status,
      code: body?.code ?? this.resolveErrorCode(status),
      message,
      details: this.normalizeDetails(
        body?.details ??
          (Array.isArray(body?.message)
            ? body.message
            : body?.message
              ? [body.message]
              : [])
      )
    };
  }

  private normalizePrismaException(
    exception: Prisma.PrismaClientKnownRequestError
  ) {
    if (exception.code === 'P2002') {
      const target = Array.isArray(exception.meta?.target)
        ? exception.meta.target.join(',')
        : this.toDetailString(exception.meta?.target);
      const modelName =
        typeof exception.meta?.modelName === 'string'
          ? exception.meta.modelName
          : undefined;
      const uniqueError = this.resolveUniqueConstraintError(target, modelName);

      return {
        status: HttpStatus.BAD_REQUEST,
        ...uniqueError
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Có lỗi xảy ra, vui lòng thử lại sau',
      details: []
    };
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

    return 'INTERNAL_ERROR';
  }

  private resolveErrorMessage(status: HttpStatus) {
    if (status === HttpStatus.BAD_REQUEST) {
      return 'Dữ liệu không hợp lệ';
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      return 'Bạn cần đăng nhập để tiếp tục';
    }

    if (status === HttpStatus.FORBIDDEN) {
      return 'Không có quyền truy cập';
    }

    if (status === HttpStatus.NOT_FOUND) {
      return 'Không tìm thấy dữ liệu';
    }

    return 'Có lỗi xảy ra, vui lòng thử lại sau';
  }

  private resolveUniqueConstraintError(target: string, modelName?: string) {
    if (target === 'code' && modelName) {
      const modelMappings: Record<
        string,
        { code: string; message: string; details: string[] }
      > = {
        Train: {
          code: 'TRAIN_CODE_DUPLICATED',
          message: 'Mã tàu đã tồn tại',
          details: ['Mã tàu đã tồn tại']
        },
        Trip: {
          code: 'TRIP_CODE_DUPLICATED',
          message: 'Mã chuyến đã tồn tại',
          details: ['Mã chuyến đã tồn tại']
        },
        Station: {
          code: 'STATION_CODE_DUPLICATED',
          message: 'Mã ga đã tồn tại',
          details: ['Mã ga đã tồn tại']
        },
        Role: {
          code: 'ROLE_CODE_DUPLICATED',
          message: 'Mã vai trò đã tồn tại',
          details: ['Mã vai trò đã tồn tại']
        },
        Permission: {
          code: 'PERMISSION_CODE_DUPLICATED',
          message: 'Mã quyền đã tồn tại',
          details: ['Mã quyền đã tồn tại']
        }
      };

      const modelError = modelMappings[modelName];
      if (modelError) {
        return modelError;
      }
    }

    if (modelName === 'User') {
      const userMappings: Record<
        string,
        { code: string; message: string; details: string[] }
      > = {
        email: {
          code: 'USER_EMAIL_DUPLICATED',
          message: 'Email đã tồn tại',
          details: ['Email đã tồn tại']
        },
        phone: {
          code: 'USER_PHONE_DUPLICATED',
          message: 'Số điện thoại đã tồn tại',
          details: ['Số điện thoại đã tồn tại']
        }
      };
      const userError = userMappings[target];
      if (userError) {
        return userError;
      }
    }

    const mappings: Record<
      string,
      { code: string; message: string; details: string[] }
    > = {
      code: {
        code: 'DUPLICATED_CODE',
        message: 'Mã đã tồn tại',
        details: ['Mã đã tồn tại trong hệ thống']
      },
      'train_id,carriage_number': {
        code: 'CARRIAGE_NUMBER_DUPLICATED',
        message: 'Số toa đã tồn tại',
        details: ['Số toa đã tồn tại trong tàu']
      },
      'train_id,active_carriage_number': {
        code: 'CARRIAGE_NUMBER_DUPLICATED',
        message: 'Số toa đã tồn tại',
        details: ['Số toa đã tồn tại trong tàu']
      },
      'carriage_id,seat_number': {
        code: 'SEAT_NUMBER_DUPLICATED',
        message: 'Số ghế đã tồn tại',
        details: ['Số ghế đã tồn tại trong toa']
      },
      'carriage_id,active_seat_number': {
        code: 'SEAT_NUMBER_DUPLICATED',
        message: 'Số ghế đã tồn tại',
        details: ['Số ghế đã tồn tại trong toa']
      }
    };

    return (
      mappings[target] ?? {
        code: 'DUPLICATED_VALUE',
        message: 'Dữ liệu đã tồn tại',
        details: ['Dữ liệu đã tồn tại trong hệ thống']
      }
    );
  }

  private normalizeDetails(details: unknown): string[] {
    if (Array.isArray(details)) {
      return details.map((detail) => this.toDetailString(detail));
    }

    if (details === undefined || details === null) {
      return [];
    }

    return [this.toDetailString(details)];
  }

  private toDetailString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }

    if (value === undefined || value === null) {
      return '';
    }

    return JSON.stringify(value);
  }
}
