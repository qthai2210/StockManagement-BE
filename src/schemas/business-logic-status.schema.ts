import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiStatus } from './api-status.schema';

export type BusinessLogicStatusDocument = BusinessLogicStatus & Document;

@Schema({ timestamps: true })
export class BusinessLogicStatus extends ApiStatus {
  @Prop({ default: 'business_logic' })
  statusType: string;

  @Prop({ required: true })
  businessFunction: string; // e.g., 'user_registration', 'stock_trading', 'payment_processing'

  @Prop({ default: 0 })
  transactionCount: number;

  @Prop({ default: 0 })
  successfulTransactions: number;

  @Prop({ default: 0 })
  failedTransactions: number;

  @Prop({ default: 0 })
  pendingTransactions: number;

  @Prop({ default: 0 })
  averageTransactionTime: number;

  @Prop({ default: 0 })
  revenueGenerated: number;

  @Prop()
  lastTransaction: Date;

  @Prop()
  lastSuccessfulTransaction: Date;

  @Prop()
  lastFailedTransaction: Date;

  @Prop()
  lastFailedReason: string;

  @Prop({ type: Object })
  businessMetrics: {
    conversionRate: number;
    abandonmentRate: number;
    averageOrderValue: number;
    customerSatisfaction: number;
  };

  @Prop({ type: [String], default: [] })
  criticalErrors: string[];

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop()
  scheduledMaintenance: Date;

  @Prop({ default: 'operational' })
  operationalStatus: string; // operational, degraded, down
}

export const BusinessLogicStatusSchema =
  SchemaFactory.createForClass(BusinessLogicStatus);
