import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiStatus } from './api-status.schema';

export type DatabaseStatusDocument = DatabaseStatus & Document;

@Schema({ timestamps: true })
export class DatabaseStatus extends ApiStatus {
  @Prop({ default: 'database' })
  statusType: string;

  @Prop({ default: 0 })
  connectionCount: number;

  @Prop({ default: 0 })
  queryCount: number;

  @Prop({ default: 0 })
  slowQueryCount: number;

  @Prop({ default: 0 })
  averageQueryTime: number;

  @Prop()
  lastSlowQuery: string;

  @Prop({
    type: Object,
    default: () => ({
      active: 0,
      idle: 0,
      total: 0,
    }),
  })
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };

  @Prop({ default: 'connected' })
  connectionStatus: string; // connected, disconnected, error

  @Prop()
  databaseVersion: string;

  @Prop()
  lastConnectionError: string;
}

export const DatabaseStatusSchema =
  SchemaFactory.createForClass(DatabaseStatus);
