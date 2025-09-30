import { Controller, Get } from '@nestjs/common';
import { ApiLogService } from './common/services/api-log.service';

@Controller()
export class AppController {
  constructor(private readonly apiLogService: ApiLogService) {}

  @Get()
  getHello(): object {
    return {
      message: 'Stock Management API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
  @Get('api/logs')
  async getLogs() {
    try {
      const logs = await this.apiLogService.getLogs(10);
      return {
        success: true,
        data: logs,
        count: logs.length,
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch logs',
        data: [],
      };
    }
  }

  @Get('api/stats')
  async getStats() {
    try {
      const stats = await this.apiLogService.getLogStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch stats',
        data: null,
      };
    }
  }
}
