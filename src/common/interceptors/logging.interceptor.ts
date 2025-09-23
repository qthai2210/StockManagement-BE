/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiLogService } from '../services/api-log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly apiLogService: ApiLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = request.requestId || 'unknown';
    const startTime = Date.now();

    // Log incoming request with request ID
    this.logger.log(
      `📨 [${requestId}] [${method}] ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Log request body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
      this.logger.log(
        `📝 [${requestId}] Request Body: ${JSON.stringify(request.body)}`,
      );
    }

    // Log query parameters if they exist
    if (Object.keys(request.query || {}).length > 0) {
      this.logger.log(
        `🔍 [${requestId}] Query Params: ${JSON.stringify(request.query)}`,
      );
    }

    return next.handle().pipe(
      tap(
        (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = response.statusCode;

          // Log successful response
          this.logger.log(
            `✅ [${requestId}] [${method}] ${url} - ${statusCode} - ${duration}ms`,
          );

          // Log response data (be careful with sensitive data in production)
          if (
            data &&
            typeof data === 'object' &&
            Object.keys(data).length > 0
          ) {
            this.logger.debug(
              `📤 [${requestId}] Response: ${JSON.stringify(data)}`,
            );
          }

          // Save log to database asynchronously
          this.saveLogToDatabase({
            requestId,
            method,
            url,
            statusCode,
            responseTime: duration,
            ip,
            userAgent,
            requestBody: request.body,
            queryParams: request.query,
            responseBody: data,
          }).catch((error) => {
            this.logger.error(
              `Failed to save log to database: ${error.message}`,
            );
          });
        },
        (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = error.status || 500;

          // Log error response
          this.logger.error(
            `❌ [${requestId}] [${method}] ${url} - ${statusCode} - ${duration}ms - Error: ${error.message}`,
          );

          // Log error stack in debug mode
          if (error.stack) {
            this.logger.debug(`🔥 [${requestId}] Stack: ${error.stack}`);
          }

          // Save error log to database asynchronously
          this.saveLogToDatabase({
            requestId,
            method,
            url,
            statusCode,
            responseTime: duration,
            ip,
            userAgent,
            requestBody: request.body,
            queryParams: request.query,
            errorMessage: error.message,
            errorStack: error.stack,
          }).catch((dbError) => {
            this.logger.error(
              `Failed to save error log to database: ${dbError.message}`,
            );
          });
        },
      ),
    );
  }

  private async saveLogToDatabase(logData: any): Promise<void> {
    try {
      await this.apiLogService.saveLog(logData);
    } catch (error) {
      // Don't throw here to avoid affecting the original request
      this.logger.error('Database logging failed:', error);
    }
  }
}
