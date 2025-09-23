import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiStatus } from './api-status.schema';

export type ExternalServiceStatusDocument = ExternalServiceStatus & Document;

@Schema({ timestamps: true })
export class ExternalServiceStatus extends ApiStatus {
  @Prop({ default: 'external_service' })
  statusType: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  serviceUrl: string;

  @Prop({ default: 'unknown' })
  serviceVersion: string;

  @Prop({ default: 0 })
  timeoutCount: number;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ default: 5000 })
  timeoutThreshold: number; // milliseconds

  @Prop()
  lastPingTime: Date;

  @Prop({ default: 0 })
  lastPingResponseTime: number;

  @Prop({ default: 'unknown' })
  serviceHealth: string; // healthy, degraded, down, unknown

  @Prop()
  healthCheckUrl: string;

  @Prop()
  lastHealthCheck: Date;

  @Prop({ type: Object })
  serviceMetrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };

  @Prop({ type: [String], default: [] })
  dependencies: string[];

  @Prop({ default: false })
  isCircuitBreakerOpen: boolean;
}

export const ExternalServiceStatusSchema = SchemaFactory.createForClass(
  ExternalServiceStatus,
);
