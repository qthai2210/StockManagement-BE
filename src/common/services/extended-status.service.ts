import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DatabaseStatus,
  DatabaseStatusDocument,
} from '../../schemas/database-status.schema';
import {
  AuthStatus,
  AuthStatusDocument,
} from '../../schemas/auth-status.schema';
import {
  ExternalServiceStatus,
  ExternalServiceStatusDocument,
} from '../../schemas/external-service-status.schema';
import {
  CacheStatus,
  CacheStatusDocument,
} from '../../schemas/cache-status.schema';
import {
  SecurityStatus,
  SecurityStatusDocument,
} from '../../schemas/security-status.schema';
import {
  BusinessLogicStatus,
  BusinessLogicStatusDocument,
} from '../../schemas/business-logic-status.schema';

@Injectable()
export class ExtendedStatusService {
  constructor(
    @InjectModel(DatabaseStatus.name)
    private databaseStatusModel: Model<DatabaseStatusDocument>,
    @InjectModel(AuthStatus.name)
    private authStatusModel: Model<AuthStatusDocument>,
    @InjectModel(ExternalServiceStatus.name)
    private externalServiceStatusModel: Model<ExternalServiceStatusDocument>,
    @InjectModel(CacheStatus.name)
    private cacheStatusModel: Model<CacheStatusDocument>,
    @InjectModel(SecurityStatus.name)
    private securityStatusModel: Model<SecurityStatusDocument>,
    @InjectModel(BusinessLogicStatus.name)
    private businessLogicStatusModel: Model<BusinessLogicStatusDocument>,
  ) {}

  // Database Status Methods
  async updateDatabaseStatus(
    endpoint: string,
    data: Partial<DatabaseStatus>,
  ): Promise<DatabaseStatus> {
    return this.databaseStatusModel
      .findOneAndUpdate(
        { endpoint },
        { ...data, lastAccessedAt: new Date() },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getDatabaseStatus(): Promise<DatabaseStatus[]> {
    return this.databaseStatusModel.find().exec();
  }

  // Auth Status Methods
  async updateAuthStatus(
    endpoint: string,
    data: Partial<AuthStatus>,
  ): Promise<AuthStatus> {
    return this.authStatusModel
      .findOneAndUpdate(
        { endpoint },
        { ...data, lastAccessedAt: new Date() },
        { upsert: true, new: true },
      )
      .exec();
  }

  async recordLoginAttempt(
    endpoint: string,
    success: boolean,
    reason?: string,
  ): Promise<void> {
    const update: any = {
      $inc: {
        loginAttempts: 1,
        ...(success ? { successfulLogins: 1 } : { failedLogins: 1 }),
      },
      $set: {
        ...(success
          ? { lastSuccessfulLogin: new Date() }
          : { lastFailedLogin: new Date(), lastFailedLoginReason: reason }),
      },
    };

    await this.authStatusModel
      .findOneAndUpdate({ endpoint }, update, { upsert: true })
      .exec();
  }

  // External Service Status Methods
  async updateExternalServiceStatus(
    serviceName: string,
    data: Partial<ExternalServiceStatus>,
  ): Promise<ExternalServiceStatus> {
    return this.externalServiceStatusModel
      .findOneAndUpdate(
        { serviceName },
        { ...data, lastAccessedAt: new Date() },
        { upsert: true, new: true },
      )
      .exec();
  }

  async pingExternalService(
    serviceName: string,
    responseTime: number,
    success: boolean,
  ): Promise<void> {
    const update: any = {
      $inc: {
        totalRequests: 1,
        ...(success ? { successfulRequests: 1 } : { failedRequests: 1 }),
      },
      $set: {
        lastPingTime: new Date(),
        lastPingResponseTime: responseTime,
        serviceHealth: success ? 'healthy' : 'degraded',
      },
    };

    await this.externalServiceStatusModel
      .findOneAndUpdate({ serviceName }, update, { upsert: true })
      .exec();
  }

  // Cache Status Methods
  async updateCacheStatus(
    endpoint: string,
    data: Partial<CacheStatus>,
  ): Promise<CacheStatus> {
    const hitRatio =
      data.hitCount && data.missCount
        ? data.hitCount / (data.hitCount + data.missCount)
        : undefined;

    return this.cacheStatusModel
      .findOneAndUpdate(
        { endpoint },
        { ...data, hitRatio, lastAccessedAt: new Date() },
        { upsert: true, new: true },
      )
      .exec();
  }

  async recordCacheOperation(
    endpoint: string,
    operation: 'hit' | 'miss' | 'eviction',
  ): Promise<void> {
    const update: any = {
      $inc: {
        ...(operation === 'hit' && { hitCount: 1 }),
        ...(operation === 'miss' && { missCount: 1 }),
        ...(operation === 'eviction' && { evictionCount: 1 }),
      },
    };

    await this.cacheStatusModel
      .findOneAndUpdate({ endpoint }, update, { upsert: true })
      .exec();
  }

  // Security Status Methods
  async updateSecurityStatus(
    endpoint: string,
    data: Partial<SecurityStatus>,
  ): Promise<SecurityStatus> {
    return this.securityStatusModel
      .findOneAndUpdate(
        { endpoint },
        { ...data, lastAccessedAt: new Date() },
        { upsert: true, new: true },
      )
      .exec();
  }

  async recordSecurityEvent(
    endpoint: string,
    eventType: 'blocked' | 'suspicious' | 'rate_limit' | 'ddos',
    details?: any,
  ): Promise<void> {
    const update: any = {
      $inc: {
        ...(eventType === 'blocked' && { blockedRequests: 1 }),
        ...(eventType === 'suspicious' && { suspiciousActivity: 1 }),
        ...(eventType === 'rate_limit' && { rateLimitViolations: 1 }),
      },
      $set: {},
    };

    if (eventType === 'ddos') {
      update.$set.ddosDetected = true;
      update.$set.lastDdosDetection = new Date();
    }

    if (eventType === 'blocked' || eventType === 'suspicious') {
      update.$set.lastSecurityIncident = new Date();
    }

    await this.securityStatusModel
      .findOneAndUpdate({ endpoint }, update, { upsert: true })
      .exec();
  }

  // Business Logic Status Methods
  async updateBusinessLogicStatus(
    businessFunction: string,
    data: Partial<BusinessLogicStatus>,
  ): Promise<BusinessLogicStatus> {
    return this.businessLogicStatusModel
      .findOneAndUpdate(
        { businessFunction },
        { ...data, lastAccessedAt: new Date() },
        { upsert: true, new: true },
      )
      .exec();
  }

  async recordBusinessTransaction(
    businessFunction: string,
    success: boolean,
    transactionTime: number,
    revenue?: number,
    failureReason?: string,
  ): Promise<void> {
    const update: any = {
      $inc: {
        transactionCount: 1,
        ...(success
          ? { successfulTransactions: 1 }
          : { failedTransactions: 1 }),
        ...(revenue && { revenueGenerated: revenue }),
      },
      $set: {
        lastTransaction: new Date(),
        ...(success
          ? { lastSuccessfulTransaction: new Date() }
          : {
              lastFailedTransaction: new Date(),
              lastFailedReason: failureReason,
            }),
      },
    };

    // Update average transaction time
    const status = await this.businessLogicStatusModel
      .findOne({ businessFunction })
      .exec();
    if (status) {
      const newAverage =
        (status.averageTransactionTime * (status.transactionCount || 0) +
          transactionTime) /
        ((status.transactionCount || 0) + 1);
      update.$set.averageTransactionTime = newAverage;
    } else {
      update.$set.averageTransactionTime = transactionTime;
    }

    await this.businessLogicStatusModel
      .findOneAndUpdate({ businessFunction }, update, { upsert: true })
      .exec();
  }

  // Global Status Overview
  async getSystemOverview(): Promise<{
    database: DatabaseStatus[];
    auth: AuthStatus[];
    externalServices: ExternalServiceStatus[];
    cache: CacheStatus[];
    security: SecurityStatus[];
    businessLogic: BusinessLogicStatus[];
  }> {
    const [database, auth, externalServices, cache, security, businessLogic] =
      await Promise.all([
        this.databaseStatusModel.find().exec(),
        this.authStatusModel.find().exec(),
        this.externalServiceStatusModel.find().exec(),
        this.cacheStatusModel.find().exec(),
        this.securityStatusModel.find().exec(),
        this.businessLogicStatusModel.find().exec(),
      ]);

    return {
      database,
      auth,
      externalServices,
      cache,
      security,
      businessLogic,
    };
  }
}
