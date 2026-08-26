import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => {
        // If the service already returns { data, meta } shape, unwrap it
        if (payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload) {
          return {
            success: true,
            data: payload.data,
            meta: payload.meta,
          };
        }
        return {
          success: true,
          data: payload ?? null,
          meta: null,
        };
      }),
    );
  }
}
