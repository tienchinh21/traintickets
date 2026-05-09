import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

type ApiResponse = {
  success: true;
  data: unknown;
  meta: Record<string, unknown>;
  message: string;
};

type ResponseEnvelope<T> = {
  data?: T;
  meta?: Record<string, unknown>;
  message?: string;
};

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<ApiResponse> {
    return next.handle().pipe(
      map((payload: T) => {
        if (this.isEnvelope(payload)) {
          return {
            success: true,
            data: this.serialize(payload.data),
            meta: payload.meta ?? {},
            message: payload.message ?? 'Thành công'
          };
        }

        return {
          success: true,
          data: this.serialize(payload),
          meta: {},
          message: 'Thành công'
        };
      })
    );
  }

  private isEnvelope(payload: T): payload is T & ResponseEnvelope<T> {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      ('data' in payload || 'meta' in payload || 'message' in payload)
    );
  }

  private serialize(value: unknown): unknown {
    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (value instanceof Date) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, entryValue]) => [
          key,
          this.serialize(entryValue)
        ])
      );
    }

    return value;
  }
}
