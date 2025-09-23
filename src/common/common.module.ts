import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiLog, ApiLogSchema } from '../schemas/api-log.schema';
import { ApiStatus, ApiStatusSchema } from '../schemas/api-status.schema';
import {
  DatabaseStatus,
  DatabaseStatusSchema,
} from '../schemas/database-status.schema';
import { AuthStatus, AuthStatusSchema } from '../schemas/auth-status.schema';
import {
  ExternalServiceStatus,
  ExternalServiceStatusSchema,
} from '../schemas/external-service-status.schema';
import { CacheStatus, CacheStatusSchema } from '../schemas/cache-status.schema';
import {
  SecurityStatus,
  SecurityStatusSchema,
} from '../schemas/security-status.schema';
import {
  BusinessLogicStatus,
  BusinessLogicStatusSchema,
} from '../schemas/business-logic-status.schema';
import { ApiLogService } from './services/api-log.service';
import { ExtendedStatusService } from './services/extended-status.service';
import { ApiStatusController } from './controllers/api-status.controller';
import { ExtendedStatusController } from './controllers/extended-status.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApiLog.name, schema: ApiLogSchema },
      { name: ApiStatus.name, schema: ApiStatusSchema },
      { name: DatabaseStatus.name, schema: DatabaseStatusSchema },
      { name: AuthStatus.name, schema: AuthStatusSchema },
      { name: ExternalServiceStatus.name, schema: ExternalServiceStatusSchema },
      { name: CacheStatus.name, schema: CacheStatusSchema },
      { name: SecurityStatus.name, schema: SecurityStatusSchema },
      { name: BusinessLogicStatus.name, schema: BusinessLogicStatusSchema },
    ]),
  ],
  controllers: [ApiStatusController, ExtendedStatusController],
  providers: [ApiLogService, ExtendedStatusService],
  exports: [ApiLogService, ExtendedStatusService],
})
export class CommonModule {}
