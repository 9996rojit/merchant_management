import { Test, TestingModule } from '@nestjs/testing';
import { MerchantApplicationsController } from './merchant-application.controller';
import { MerchantApplicationService } from './merchant-application.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MerchantApplication } from './entities/merchant-application.entity';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guard/roles.guard';
import { SalesOwnerGuard } from '../common/guard/sales-owner.guard';

describe('MerchantApplicationsController', () => {
  let controller: MerchantApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantApplicationsController],
      providers: [
        { provide: MerchantApplicationService, useValue: {} },
        { provide: getRepositoryToken(MerchantApplication), useValue: {} },
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: RolesGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: SalesOwnerGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
      ],
    }).compile();

    controller = module.get<MerchantApplicationsController>(MerchantApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
