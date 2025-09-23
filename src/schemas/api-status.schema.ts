import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiStatusDocument = ApiStatus & Document;

@Schema({ timestamps: true })
export class ApiStatus {
  @Prop({ required: true, unique: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ default: 'active' })
  status: string; // active, inactive, maintenance, deprecated

  @Prop({ default: 0 })
  totalRequests: number;

  @Prop({ default: 0 })
  successfulRequests: number;

  @Prop({ default: 0 })
  failedRequests: number;

  @Prop({ default: 0 })
  averageResponseTime: number;

  @Prop()
  lastAccessedAt: Date;

  @Prop()
  lastErrorAt: Date;

  @Prop()
  lastErrorMessage: string;

  @Prop({ default: true })
  isHealthy: boolean;

  @Prop()
  description: string;

  @Prop({ type: Object })
  metadata: any;
}

export const ApiStatusSchema = SchemaFactory.createForClass(ApiStatus);
