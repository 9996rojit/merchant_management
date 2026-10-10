import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskStatus } from '@app/lib';
import { MerchantApplication } from '../merchant-application/entities/merchant-application.entity';

@Injectable()
@Processor('risk-review')
export class RiskReviewProcessor extends WorkerHost {
    private readonly logger = new Logger(RiskReviewProcessor.name);

    constructor(
        @InjectRepository(MerchantApplication)
        private readonly applicationRepository: Repository<MerchantApplication>,
    ) {
        super();
    }

    async process(job: Job<{ applicationId: string }>): Promise<void> {
        const { applicationId } = job.data;
        const application = await this.applicationRepository.findOne({ where: { id: applicationId } });

        if (!application) {
            this.logger.warn(`Application ${applicationId} was not found; skipping risk review.`);
            return;
        }

        if (application.riskStatus !== RiskStatus.PENDING) {
            this.logger.log(`Risk review already completed for application ${applicationId}; skipping.`);
            return;
        }

        application.riskStatus = RiskStatus.PASSED;
        application.riskDetail = JSON.stringify({
            provider: 'MockKYB',
            score: 12,
            checkedAt: new Date().toISOString(),
        });

        await this.applicationRepository.save(application);
        this.logger.log(`Risk review completed for application ${applicationId}.`);
    }
}