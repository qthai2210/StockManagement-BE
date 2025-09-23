import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiStatus } from './api-status.schema';

export type CacheStatusDocument = CacheStatus & Document;

@Schema({ timestamps: true })
export class CacheStatus extends ApiStatus {
  @Prop({ default: 'cache' })
  statusType: string;

  @Prop({ default: 'redis' })
  cacheType: string; // redis, memory, file

  @Prop({ default: 0 })
  hitCount: number;

  @Prop({ default: 0 })
  missCount: number;

  @Prop({ default: 0 })
  evictionCount: number;

  @Prop({ default: 0 })
  totalKeys: number;

  @Prop({ default: 0 })
  expiredKeys: number;

  @Prop({ default: 0 })
  memoryUsage: number; // in bytes

  @Prop({ default: 0 })
  maxMemory: number; // in bytes

  @Prop()
  hitRatio: number; // calculated field

  @Prop({ default: 0 })
  averageKeySize: number;

  @Prop({ default: 0 })
  averageValueSize: number;

  @Prop()
  lastCacheFlush: Date;

  @Prop({ type: Object })
  cacheConfig: {
    ttl: number;
    maxKeys: number;
    evictionPolicy: string;
  };

  @Prop({ default: 'connected' })
  connectionStatus: string; // connected, disconnected, error

  @Prop()
  cacheVersion: string;
}

export const CacheStatusSchema = SchemaFactory.createForClass(CacheStatus);
