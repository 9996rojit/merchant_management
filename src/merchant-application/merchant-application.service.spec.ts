import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicationStatus, RiskStatus, UserRole } from '@app/lib';
import { MerchantApplication } from './entities/merchant-application.entity';
import { MerchantApplicationService } from './merchant-application.service';
import { AuditService } from '../audit/audit.service';

describe('MerchantApplicationService', () => {
  let service: MerchantApplicationService;
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const queryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
  };
  const auditService = { create: jest.fn() };
  const riskQueue = { add: jest.fn() };
  const createApplication = (): MerchantApplication => ({
    id: '8572e5ad-3a18-4c32-9677-8788389224d8',
    businessName: 'Sample Merchant',
    createdById: 'sales-user-id',
    assignedReviewerId: 'reviewer-user-id',
    status: ApplicationStatus.SUBMITTED,
    riskStatus: RiskStatus.PENDING,
  } as MerchantApplication);
  let application: MerchantApplication;

  beforeEach(async () => {
    jest.clearAllMocks();
    application = createApplication();
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    repository.save.mockImplementation(async (entity: MerchantApplication) => entity);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantApplicationService,
        { provide: getRepositoryToken(MerchantApplication), useValue: repository },
        { provide: AuditService, useValue: auditService },
        { provide: getQueueToken('risk-review'), useValue: riskQueue },
      ],
    }).compile();

    service = module.get<MerchantApplicationService>(MerchantApplicationService);
  });

  it('creates, audits, and queues a submitted merchant application', async () => {
    const dto = {
      businessName: 'Sample Merchant',
      legalBusinessName: 'Sample Merchant LLC',
      businessType: 'LLC',
      ownerName: 'Test Owner',
      ownerEmail: 'owner@example.com',
      ownerPhone: '+1-555-0100',
      requestedProcessingInfo: {
        estimatedMonthlyVolumeUSD: 100000,
        averageTicketSizeUSD: 50,
        highRiskProducts: false,
      },
    };
    repository.create.mockReturnValue(application);
    repository.save.mockResolvedValue(application);
    auditService.create.mockResolvedValue(undefined);
    riskQueue.add.mockResolvedValue(undefined);

    await expect(service.create(dto, 'sales-user-id')).resolves.toBe(application);

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      ownerContactNumber: dto.ownerPhone,
      createdById: 'sales-user-id',
      status: ApplicationStatus.SUBMITTED,
      riskStatus: RiskStatus.PENDING,
      riskDetail: null,
    }));
    expect(auditService.create).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'sales-user-id',
      action: 'APPLICATION_CREATED',
      merchantApplicationId: application.id,
    }));
    expect(riskQueue.add).toHaveBeenCalledWith('evaluate-risk', { applicationId: application.id });
  });

  it('filters sales users to their own applications and paginates results', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[application], 1]);
    const salesUser = { sub: 'sales-user-id', role: UserRole.SALES, email: 'sales@example.com' };

    await expect(service.findAll({ status: ApplicationStatus.SUBMITTED, page: 2, limit: 10 }, salesUser))
      .resolves.toEqual({ data: [application], total: 1, page: 2, lastPage: 1 });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'app.status = :status', {
      status: ApplicationStatus.SUBMITTED,
    });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'app.createdById = :userId', {
      userId: salesUser.sub,
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('does not apply owner filtering to administrators', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    const adminUser = { sub: 'admin-user-id', role: UserRole.ADMIN, email: 'admin@example.com' };

    await service.findAll({ page: 1, limit: 10 }, adminUser);

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
  });

  it('returns an application by ID with its user relations', async () => {
    queryBuilder.getOne.mockResolvedValue(application);

    await expect(service.findOne(application.id)).resolves.toBe(application);
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('app.createdBy', 'createdBy');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('app.assignedReviewer', 'assignedReviewer');
  });

  it('throws when an application does not exist', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(service.findOne(application.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates and audits a non-finalized application', async () => {
    queryBuilder.getOne.mockResolvedValue(application);
    repository.save.mockResolvedValue(application);
    auditService.create.mockResolvedValue(undefined);

    await expect(service.update(application.id, { businessName: 'Updated Merchant' }, 'sales-user-id'))
      .resolves.toBe(application);
    expect(application.businessName).toBe('Updated Merchant');
    expect(auditService.create).toHaveBeenCalledWith(expect.objectContaining({
      action: 'APPLICATION_UPDATED',
      merchantApplicationId: application.id,
    }));
  });

  it('rejects updates to approved applications', async () => {
    application.status = ApplicationStatus.APPROVED;
    queryBuilder.getOne.mockResolvedValue(application);

    await expect(service.update(application.id, { businessName: 'Blocked Update' }, 'sales-user-id'))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('assigns a reviewer and moves the application under review', async () => {
    queryBuilder.getOne.mockResolvedValue(application);

    await expect(service.assignReviewer(application.id, 'reviewer-user-id')).resolves.toBe(application);
    expect(application.assignedReviewerId).toBe('reviewer-user-id');
    expect(application.status).toBe(ApplicationStatus.UNDER_REVIEW);
    expect(repository.save).toHaveBeenCalledWith(application);
  });

  it('rejects a decision from a reviewer who is not assigned', async () => {
    queryBuilder.getOne.mockResolvedValue(application);

    await expect(service.makeDecision(application.id, ApplicationStatus.APPROVED, 'other-reviewer-id'))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('records an assigned reviewer decision and writes an audit entry', async () => {
    queryBuilder.getOne.mockResolvedValue(application);
    auditService.create.mockResolvedValue(undefined);

    await expect(service.makeDecision(application.id, ApplicationStatus.APPROVED, 'reviewer-user-id'))
      .resolves.toBe(application);
    expect(application.status).toBe(ApplicationStatus.APPROVED);
    expect(auditService.create).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'reviewer-user-id',
      action: 'APPLICATION_APPROVED',
      merchantApplicationId: application.id,
    }));
  });
});
