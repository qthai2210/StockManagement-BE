import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate unique request ID
    const requestId = uuidv4();

    // Add request ID to request object for use in other parts of the app
    request.requestId = requestId;

    // Add request ID to response headers
    response.setHeader('X-Request-ID', requestId);

    return next.handle();
  }
}
