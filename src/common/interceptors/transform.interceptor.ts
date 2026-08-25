import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { PaginatedResult } from '../dto/pagination-meta.dto';

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginatedResult<unknown>['meta'];
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((payload) => {
        if (this.isPaginated(payload)) {
          return {
            success: true as const,
            message: 'Success',
            data: payload.data as T,
            meta: payload.meta,
          };
        }

        return {
          success: true as const,
          message: 'Success',
          data: payload,
        };
      }),
    );
  }

  private isPaginated(payload: T): payload is T & PaginatedResult<unknown> {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'data' in payload &&
      'meta' in payload
    );
  }
}
