import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiStatus } from './api-status.schema';

export type SecurityStatusDocument = SecurityStatus & Document;

@Schema({ timestamps: true })
export class SecurityStatus extends ApiStatus {
  @Prop({ default: 'security' })
  statusType: string;

  @Prop({ default: 0 })
  threatLevel: number; // 0-10 scale

  @Prop({ default: 0 })
  blockedRequests: number;

  @Prop({ default: 0 })
  suspiciousActivity: number;

  @Prop({ default: 0 })
  rateLimitViolations: number;

  @Prop({ type: [String], default: [] })
  blockedIPs: string[];

  @Prop({ type: [String], default: [] })
  suspiciousPatterns: string[];

  @Prop()
  lastSecurityIncident: Date;

  @Prop()
  lastSecurityScan: Date;

  @Prop({ default: 'enabled' })
  firewallStatus: string; // enabled, disabled, learning

  @Prop({ default: 'enabled' })
  rateLimitStatus: string; // enabled, disabled, warning

  @Prop({ type: Object })
  securityRules: {
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    bannedUserAgents: string[];
    allowedOrigins: string[];
  };

  @Prop({ default: false })
  ddosDetected: boolean;

  @Prop()
  lastDdosDetection: Date;

  @Prop({ default: 'low' })
  currentThreatLevel: string; // low, medium, high, critical
}

export const SecurityStatusSchema =
  SchemaFactory.createForClass(SecurityStatus);
