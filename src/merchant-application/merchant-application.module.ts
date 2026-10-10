import { Module } from '@nestjs/common';
import { MerchantApplicationService } from './merchant-application.service';
import { MerchantApplicationsController } from './merchant-application.controller';
import { AuditModule } from '../audit/audit.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MerchantApplication } from './entities/merchant-application.entity';
import { RolesGuard } from '../common/guard/roles.guard';
import { SalesOwnerGuard } from '../common/guard/sales-owner.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantApplication]),
    BullModule.registerQueue({ name: 'risk-review' }),
    AuditModule,
  ],
  controllers: [MerchantApplicationsController],
  providers: [MerchantApplicationService, RolesGuard, SalesOwnerGuard],
})
export class MerchantApplicationModule { }
