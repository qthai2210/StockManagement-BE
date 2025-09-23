import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiLogDocument = ApiLog & Document;

@Schema({ timestamps: true })
export class ApiLog {
  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  responseTime: number;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({ type: Object })
  requestBody: any;

  @Prop({ type: Object })
  queryParams: any;

  @Prop({ type: Object })
  responseBody: any;

  @Prop()
  errorMessage: string;

  @Prop()
  errorStack: string;

  @Prop({ default: 'success' })
  status: string; // success, error, warning

  @Prop()
  userId: string; // For future user tracking

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ApiLogSchema = SchemaFactory.createForClass(ApiLog);
