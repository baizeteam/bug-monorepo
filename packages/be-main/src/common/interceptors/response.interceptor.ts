import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiResponse, success, isObject } from '@bug/shared'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data) => {
        if (this.isApiResponse(data)) {
          return data
        }
        return success(data)
      }),
    )
  }

  private isApiResponse(value: unknown): value is ApiResponse {
    if (!isObject(value)) return false
    const obj = value as Record<string, unknown>
    return 'code' in obj && 'message' in obj && 'data' in obj
  }
}
