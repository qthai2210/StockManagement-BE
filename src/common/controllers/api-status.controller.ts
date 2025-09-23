import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiLogService } from '../services/api-log.service';

@Controller('api-status')
export class ApiStatusController {
  constructor(private readonly apiLogService: ApiLogService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'API is running successfully',
    };
  }

  @Get('logs')
  async getLogs(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const skipNum = skip ? parseInt(skip, 10) : 0;

    return {
      logs: await this.apiLogService.getLogs(limitNum, skipNum),
      pagination: {
        limit: limitNum,
        skip: skipNum,
      },
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.apiLogService.getLogStats();
    const apiStatuses = await this.apiLogService.getApiStatuses();

    return {
      overview: stats,
      endpoints: apiStatuses,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('errors')
  async getErrors(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return {
      errors: await this.apiLogService.getErrorLogs(limitNum),
      limit: limitNum,
    };
  }

  @Get('endpoint/:endpoint')
  async getEndpointLogs(
    @Param('endpoint') endpoint: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return {
      endpoint,
      logs: await this.apiLogService.getLogsByEndpoint(endpoint, limitNum),
      limit: limitNum,
    };
  }

  @Get('monitoring')
  async getMonitoringData() {
    const stats = await this.apiLogService.getLogStats();
    const apiStatuses = await this.apiLogService.getApiStatuses();
    const recentErrors = await this.apiLogService.getErrorLogs(10);

    // Calculate health score
    const healthScore =
      stats.total > 0
        ? Math.max(0, 100 - parseFloat(stats.errorRate as string))
        : 100;

    return {
      health: {
        score: healthScore,
        status:
          healthScore > 95
            ? 'excellent'
            : healthScore > 85
              ? 'good'
              : healthScore > 70
                ? 'fair'
                : 'poor',
        uptime: process.uptime(),
      },
      statistics: stats,
      endpoints: apiStatuses.slice(0, 10), // Top 10 most used endpoints
      recentErrors,
      timestamp: new Date().toISOString(),
    };
  }
}
