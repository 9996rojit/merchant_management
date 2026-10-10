import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskReviewProcessor } from './risk-review.process';
import { MerchantApplication } from '../merchant-application/entities/merchant-application.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MerchantApplication])],
    providers: [RiskReviewProcessor],
})
export class RiskReviewModule { }
