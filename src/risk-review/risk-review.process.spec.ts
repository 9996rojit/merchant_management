import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { RiskStatus } from '@app/lib';
import { MerchantApplication } from '../merchant-application/entities/merchant-application.entity';
import { RiskReviewProcessor } from './risk-review.process';

describe('RiskReviewProcessor', () => {
    let processor: RiskReviewProcessor;
    const applicationRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RiskReviewProcessor,
                { provide: getRepositoryToken(MerchantApplication), useValue: applicationRepository },
            ],
        }).compile();

        processor = module.get<RiskReviewProcessor>(RiskReviewProcessor);
    });

    it('stores a mock risk result for a pending application', async () => {
        const application = {
            riskStatus: RiskStatus.PENDING,
            riskDetail: null,
        } as MerchantApplication;
        applicationRepository.findOne.mockResolvedValue(application);
        applicationRepository.save.mockResolvedValue(application);
        const job = { data: { applicationId: 'application-id' } } as Job<{ applicationId: string }>;

        await processor.process(job);

        expect(application.riskStatus).toBe(RiskStatus.PASSED);
        expect(JSON.parse(application.riskDetail ?? '')).toMatchObject({ provider: 'MockKYB', score: 12 });
        expect(applicationRepository.save).toHaveBeenCalledWith(application);
    });

    it('does not process an application with an existing risk result', async () => {
        const application = {
            riskStatus: RiskStatus.PASSED,
            riskDetail: '{"provider":"MockKYB"}',
        } as MerchantApplication;
        applicationRepository.findOne.mockResolvedValue(application);
        const job = { data: { applicationId: 'application-id' } } as Job<{ applicationId: string }>;

        await processor.process(job);

        expect(applicationRepository.save).not.toHaveBeenCalled();
    });

    it('skips risk processing when the application does not exist', async () => {
        applicationRepository.findOne.mockResolvedValue(null);
        const job = { data: { applicationId: 'missing-application-id' } } as Job<{ applicationId: string }>;

        await expect(processor.process(job)).resolves.toBeUndefined();
        expect(applicationRepository.save).not.toHaveBeenCalled();
    });
});