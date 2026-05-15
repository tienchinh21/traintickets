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
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    // Only treat as envelope if it has 'data' or 'message' key AND
    // does NOT look like a regular DB record (has createdAt/updatedAt/id)
    const hasEnvelopeKeys =
      'data' in payload || 'meta' in payload || 'message' in payload;

    if (!hasEnvelopeKeys) {
      return false;
    }

    // If it has typical entity fields, it's a DB record, not an envelope
    const hasEntityFields =
      'id' in payload || 'createdAt' in payload || 'updatedAt' in payload;

    if (hasEntityFields && !('meta' in payload)) {
      return false;
    }

    return true;
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
