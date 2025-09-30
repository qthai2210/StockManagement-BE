import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiLog, ApiLogDocument } from '../../schemas/api-log.schema';
import { ApiStatus, ApiStatusDocument } from '../../schemas/api-status.schema';

export interface LogData {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  ip?: string;
  userAgent?: string;
  requestBody?: any;
  queryParams?: any;
  responseBody?: any;
  errorMessage?: string;
  errorStack?: string;
  userId?: string;
}

@Injectable()
export class ApiLogService {
  constructor(
    @InjectModel(ApiLog.name) private apiLogModel: Model<ApiLogDocument>,
    @InjectModel(ApiStatus.name)
    private apiStatusModel: Model<ApiStatusDocument>,
  ) {}

  async saveLog(logData: LogData): Promise<ApiLog | null> {
    try {
      const log = new this.apiLogModel({
        ...logData,
        status:
          logData.statusCode >= 400
            ? 'error'
            : logData.statusCode >= 300
              ? 'warning'
              : 'success',
        timestamp: new Date(),
      });

      const savedLog = await log.save();

      // Update API status asynchronously with timeout for serverless
      Promise.race([
        this.updateApiStatus(logData),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000),
        ),
      ]).catch((error) => {
        console.error('Failed to update API status:', error);
      });

      return savedLog;
    } catch (error) {
      console.error('Failed to save API log:', error);
      // Don't throw in serverless to avoid function failures
      return null;
    }
  }

  async updateApiStatus(logData: LogData): Promise<void> {
    const endpointKey = `${logData.method}:${this.normalizeEndpoint(logData.url)}`;

    const updateData = {
      $inc: {
        totalRequests: 1,
        ...(logData.statusCode < 400
          ? { successfulRequests: 1 }
          : { failedRequests: 1 }),
      },
      $set: {
        lastAccessedAt: new Date(),
        ...(logData.statusCode >= 400 && {
          lastErrorAt: new Date(),
          lastErrorMessage:
            logData.errorMessage || `HTTP ${logData.statusCode}`,
          isHealthy: false,
        }),
      },
    };

    await this.apiStatusModel.updateOne(
      { endpoint: endpointKey, method: logData.method },
      updateData,
      { upsert: true },
    );

    // Update average response time
    await this.updateAverageResponseTime(endpointKey, logData.responseTime);
  }

  private async updateAverageResponseTime(
    endpointKey: string,
    responseTime: number,
  ): Promise<void> {
    const status = await this.apiStatusModel.findOne({ endpoint: endpointKey });
    if (status) {
      const newAverage =
        (status.averageResponseTime * (status.totalRequests - 1) +
          responseTime) /
        status.totalRequests;
      await this.apiStatusModel.updateOne(
        { endpoint: endpointKey },
        { $set: { averageResponseTime: Math.round(newAverage) } },
      );
    }
  }

  private normalizeEndpoint(url: string): string {
    // Replace dynamic segments with placeholders
    return url
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9]{24}/g, '/:id') // MongoDB ObjectId
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid'); // UUID
  }

  async getLogs(limit: number = 100, skip: number = 0): Promise<ApiLog[]> {
    return this.apiLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getApiStatuses(): Promise<ApiStatus[]> {
    return this.apiStatusModel.find().sort({ totalRequests: -1 }).exec();
  }

  async getLogsByEndpoint(
    endpoint: string,
    limit: number = 50,
  ): Promise<ApiLog[]> {
    return this.apiLogModel
      .find({ url: new RegExp(endpoint) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getErrorLogs(limit: number = 50): Promise<ApiLog[]> {
    return this.apiLogModel
      .find({ status: 'error' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getLogStats(): Promise<any> {
    const totalLogs = await this.apiLogModel.countDocuments();
    const errorLogs = await this.apiLogModel.countDocuments({
      status: 'error',
    });
    const warningLogs = await this.apiLogModel.countDocuments({
      status: 'warning',
    });
    const successLogs = await this.apiLogModel.countDocuments({
      status: 'success',
    });

    return {
      total: totalLogs,
      errors: errorLogs,
      warnings: warningLogs,
      success: successLogs,
      errorRate: totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(2) : 0,
    };
  }
}
