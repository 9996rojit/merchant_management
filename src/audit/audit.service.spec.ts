import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogRepository: jest.Mocked<Pick<Repository<AuditLog>, 'create' | 'save'>>;

  beforeEach(async () => {
    auditLogRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: auditLogRepository },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates and saves an audit log', async () => {
    const createAuditDto = {
      actorId: 'a5ef2d9a-25a3-47ab-8ea2-0f7c746c9eb9',
      action: 'APPLICATION_CREATED',
      metadata: { businessName: 'Example Merchant' },
    };
    const auditLog = { ...createAuditDto } as unknown as AuditLog;
    auditLogRepository.create.mockReturnValue(auditLog);
    auditLogRepository.save.mockResolvedValue(auditLog);

    await expect(service.create(createAuditDto)).resolves.toBe(auditLog);
    expect(auditLogRepository.create).toHaveBeenCalledWith(createAuditDto);
    expect(auditLogRepository.save).toHaveBeenCalledWith(auditLog);
  });

  it('propagates persistence errors', async () => {
    const error = new Error('database unavailable');
    auditLogRepository.create.mockReturnValue({} as AuditLog);
    auditLogRepository.save.mockRejectedValue(error);

    await expect(service.create({ actorId: 'actor-id', action: 'APPLICATION_CREATED' }))
      .rejects.toBe(error);
  });
});
