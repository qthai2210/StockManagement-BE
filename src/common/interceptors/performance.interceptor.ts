import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Log performance metrics
        if (duration > 1000) {
          this.logger.warn(
            `🐌 SLOW REQUEST: [${method}] ${url} took ${duration.toFixed(2)}ms`,
          );
        } else if (duration > 500) {
          this.logger.log(
            `⚠️ [${method}] ${url} took ${duration.toFixed(2)}ms`,
          );
        } else {
          this.logger.debug(
            `⚡ [${method}] ${url} took ${duration.toFixed(2)}ms`,
          );
        }
      }),
    );
  }
}
