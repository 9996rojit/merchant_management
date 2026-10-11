import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantApplication } from './entities/merchant-application.entity';
import { AuditService } from '../audit/audit.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApplicationStatus, BasePaginationDto, RiskStatus, UserRole, type ApplicationDecision } from '@app/lib';
import { CreateMerchantApplicationDto } from './dto/create-merchant-application.dto';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { UpdateMerchantApplicationDto } from './dto/update-merchant-application.dto';

@Injectable()
export class MerchantApplicationService {
  constructor(
    @InjectRepository(MerchantApplication)
    private readonly merchantApplicationRepo: Repository<MerchantApplication>,
    private readonly auditService: AuditService,
    @InjectQueue('risk-review') private readonly riskQueue: Queue,
  ) { }

  async create(dto: CreateMerchantApplicationDto, userId: string) {
    const { ownerPhone, ...applicationDto } = dto;
    const application = this.merchantApplicationRepo.create({
      ...applicationDto,
      ownerContactNumber: ownerPhone,
      createdById: userId,
      status: ApplicationStatus.SUBMITTED,
      riskStatus: RiskStatus.PENDING,
      riskDetail: null,
    });

    const saved = await this.merchantApplicationRepo.save(application);

    await this.auditService.create({
      actorId: userId,
      action: 'APPLICATION_CREATED',
      merchantApplicationId: saved.id,
      metadata: { businessName: saved.businessName },
    });

    await this.riskQueue.add('evaluate-risk', { applicationId: saved.id });

    return saved;
  }

  async findAll(
    query: Pick<BasePaginationDto, 'page' | 'limit'> & { status?: ApplicationStatus },
    user: AuthenticatedRequest['user'],
  ) {
    const pagination = Object.assign(new BasePaginationDto(), query);
    const { status, page, limit } = pagination;
    const qb = this.merchantApplicationRepo.createQueryBuilder('app');

    if (status) {
      qb.andWhere('app.status = :status', { status });
    }

    if (user.role === UserRole.SALES) {
      qb.andWhere('app.createdById = :userId', { userId: user.sub });
    }

    qb.skip(pagination.offset).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const app = await this.merchantApplicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.createdBy', 'createdBy')
      .leftJoinAndSelect('app.assignedReviewer', 'assignedReviewer')
      .where('app.id = :id', { id })
      .getOne();
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async update(id: string, dto: UpdateMerchantApplicationDto, userId: string) {
    const app = await this.findOne(id);

    if ([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED].includes(app.status as ApplicationStatus)) {
      throw new BadRequestException('Cannot modify an application that is already finalized.');
    }

    Object.assign(app, dto);
    const updated = await this.merchantApplicationRepo.save(app);

    await this.auditService.create({
      actorId: userId,
      action: 'APPLICATION_UPDATED',
      merchantApplicationId: updated.id,
    });

    return updated;
  }

  async assignReviewer(id: string, reviewerId: string) {
    const app = await this.findOne(id);
    app.assignedReviewerId = reviewerId;
    app.status = ApplicationStatus.UNDER_REVIEW;
    await this.merchantApplicationRepo.save(app);
    return this.findOne(id);
  }

  async makeDecision(id: string, decision: ApplicationDecision, reviewerId: string) {
    const app = await this.findOne(id);

    // Ensure only the assigned reviewer (or admin) records the risk decision[cite: 1]
    if (app.assignedReviewerId !== reviewerId) {
      throw new ForbiddenException('Only the assigned reviewer can record a decision on this application.');
    }

    app.status = decision;
    const saved = await this.merchantApplicationRepo.save(app);

    await this.auditService.create({
      actorId: reviewerId,
      action: `APPLICATION_${decision}`,
      merchantApplicationId: saved.id,
    });

    return saved;
  }
}