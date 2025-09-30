import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate request ID using Node.js built-in crypto
    const requestId = request.headers['x-request-id'] || randomUUID();

    // Add request ID to request object
    request.requestId = requestId;

    // Add request ID to response headers
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      tap(() => {
        // Additional logging or processing can be done here
      }),
    );
  }
}
