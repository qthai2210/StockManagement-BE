import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiStatus } from './api-status.schema';

export type AuthStatusDocument = AuthStatus & Document;

@Schema({ timestamps: true })
export class AuthStatus extends ApiStatus {
  @Prop({ default: 'authentication' })
  statusType: string;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop({ default: 0 })
  successfulLogins: number;

  @Prop({ default: 0 })
  failedLogins: number;

  @Prop({ default: 0 })
  activeTokens: number;

  @Prop({ default: 0 })
  expiredTokens: number;

  @Prop({ default: 0 })
  revokedTokens: number;

  @Prop()
  lastSuccessfulLogin: Date;

  @Prop()
  lastFailedLogin: Date;

  @Prop()
  lastFailedLoginReason: string;

  @Prop({ type: [String], default: [] })
  suspiciousIPs: string[];

  @Prop({ default: 0 })
  blockedAttempts: number;

  @Prop({ default: 'enabled' })
  authMethod: string; // enabled, disabled, maintenance

  @Prop()
  tokenExpiration: number; // in seconds

  @Prop({ default: false })
  requiresTwoFactor: boolean;
}

export const AuthStatusSchema = SchemaFactory.createForClass(AuthStatus);
