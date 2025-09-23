import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ExtendedStatusService } from '../services/extended-status.service';

@Controller('status/extended')
export class ExtendedStatusController {
  constructor(private readonly extendedStatusService: ExtendedStatusService) {}

  // System Overview
  @Get('overview')
  async getSystemOverview() {
    return this.extendedStatusService.getSystemOverview();
  }

  // Database Status Endpoints
  @Get('database')
  async getDatabaseStatus() {
    return this.extendedStatusService.getDatabaseStatus();
  }

  @Post('database/:endpoint')
  async updateDatabaseStatus(
    @Param('endpoint') endpoint: string,
    @Body() data: any,
  ) {
    return this.extendedStatusService.updateDatabaseStatus(endpoint, data);
  }

  // Authentication Status Endpoints
  @Post('auth/login-attempt')
  async recordLoginAttempt(
    @Body()
    body: {
      endpoint: string;
      success: boolean;
      reason?: string;
    },
  ) {
    return this.extendedStatusService.recordLoginAttempt(
      body.endpoint,
      body.success,
      body.reason,
    );
  }

  // External Service Status Endpoints
  @Post('external-service/ping')
  async pingExternalService(
    @Body()
    body: {
      serviceName: string;
      responseTime: number;
      success: boolean;
    },
  ) {
    return this.extendedStatusService.pingExternalService(
      body.serviceName,
      body.responseTime,
      body.success,
    );
  }

  @Post('external-service/:serviceName')
  async updateExternalServiceStatus(
    @Param('serviceName') serviceName: string,
    @Body() data: any,
  ) {
    return this.extendedStatusService.updateExternalServiceStatus(
      serviceName,
      data,
    );
  }

  // Cache Status Endpoints
  @Post('cache/operation')
  async recordCacheOperation(
    @Body()
    body: {
      endpoint: string;
      operation: 'hit' | 'miss' | 'eviction';
    },
  ) {
    return this.extendedStatusService.recordCacheOperation(
      body.endpoint,
      body.operation,
    );
  }

  @Post('cache/:endpoint')
  async updateCacheStatus(
    @Param('endpoint') endpoint: string,
    @Body() data: any,
  ) {
    return this.extendedStatusService.updateCacheStatus(endpoint, data);
  }

  // Security Status Endpoints
  @Post('security/event')
  async recordSecurityEvent(
    @Body()
    body: {
      endpoint: string;
      eventType: 'blocked' | 'suspicious' | 'rate_limit' | 'ddos';
      details?: any;
    },
  ) {
    return this.extendedStatusService.recordSecurityEvent(
      body.endpoint,
      body.eventType,
      body.details,
    );
  }

  @Post('security/:endpoint')
  async updateSecurityStatus(
    @Param('endpoint') endpoint: string,
    @Body() data: any,
  ) {
    return this.extendedStatusService.updateSecurityStatus(endpoint, data);
  }

  // Business Logic Status Endpoints
  @Post('business/transaction')
  async recordBusinessTransaction(
    @Body()
    body: {
      businessFunction: string;
      success: boolean;
      transactionTime: number;
      revenue?: number;
      failureReason?: string;
    },
  ) {
    return this.extendedStatusService.recordBusinessTransaction(
      body.businessFunction,
      body.success,
      body.transactionTime,
      body.revenue,
      body.failureReason,
    );
  }

  @Post('business/:businessFunction')
  async updateBusinessLogicStatus(
    @Param('businessFunction') businessFunction: string,
    @Body() data: any,
  ) {
    return this.extendedStatusService.updateBusinessLogicStatus(
      businessFunction,
      data,
    );
  }

  // Health Check Endpoints for each type
  @Get('health/database')
  async getDatabaseHealth() {
    const statuses = await this.extendedStatusService.getDatabaseStatus();
    return {
      healthy: statuses.filter((s) => s.connectionStatus === 'connected')
        .length,
      total: statuses.length,
      statuses: statuses.map((s) => ({
        endpoint: s.endpoint,
        status: s.connectionStatus,
        lastAccessed: s.lastAccessedAt,
      })),
    };
  }

  @Get('health/services')
  async getExternalServicesHealth() {
    const overview = await this.extendedStatusService.getSystemOverview();
    const services = overview.externalServices;
    return {
      healthy: services.filter((s) => s.serviceHealth === 'healthy').length,
      degraded: services.filter((s) => s.serviceHealth === 'degraded').length,
      down: services.filter((s) => s.serviceHealth === 'down').length,
      total: services.length,
      services: services.map((s) => ({
        serviceName: s.serviceName,
        health: s.serviceHealth,
        lastPing: s.lastPingTime,
        responseTime: s.lastPingResponseTime,
      })),
    };
  }

  @Get('health/security')
  async getSecurityHealth() {
    const overview = await this.extendedStatusService.getSystemOverview();
    const security = overview.security;
    return {
      totalThreats: security.reduce((sum, s) => sum + s.suspiciousActivity, 0),
      blockedRequests: security.reduce((sum, s) => sum + s.blockedRequests, 0),
      highThreatLevels: security.filter((s) => s.threatLevel > 7).length,
      ddosDetected: security.some((s) => s.ddosDetected),
      statuses: security.map((s) => ({
        endpoint: s.endpoint,
        threatLevel: s.threatLevel,
        currentThreatLevel: s.currentThreatLevel,
        blockedRequests: s.blockedRequests,
        lastIncident: s.lastSecurityIncident,
      })),
    };
  }

  // Analytics Endpoints
  @Get('analytics/performance')
  async getPerformanceAnalytics(@Query('hours') hours: number = 24) {
    const overview = await this.extendedStatusService.getSystemOverview();

    return {
      database: {
        averageQueryTime:
          overview.database.reduce((avg, s) => avg + s.averageQueryTime, 0) /
          Math.max(overview.database.length, 1),
        slowQueries: overview.database.reduce(
          (sum, s) => sum + s.slowQueryCount,
          0,
        ),
      },
      cache: {
        averageHitRatio:
          overview.cache.reduce((avg, s) => avg + (s.hitRatio || 0), 0) /
          Math.max(overview.cache.length, 1),
        totalHits: overview.cache.reduce((sum, s) => sum + s.hitCount, 0),
        totalMisses: overview.cache.reduce((sum, s) => sum + s.missCount, 0),
      },
      business: {
        totalRevenue: overview.businessLogic.reduce(
          (sum, s) => sum + s.revenueGenerated,
          0,
        ),
        averageTransactionTime:
          overview.businessLogic.reduce(
            (avg, s) => avg + s.averageTransactionTime,
            0,
          ) / Math.max(overview.businessLogic.length, 1),
        successRate:
          overview.businessLogic.reduce((avg, s) => {
            const total = s.successfulTransactions + s.failedTransactions;
            return avg + (total > 0 ? s.successfulTransactions / total : 0);
          }, 0) / Math.max(overview.businessLogic.length, 1),
      },
    };
  }
}
