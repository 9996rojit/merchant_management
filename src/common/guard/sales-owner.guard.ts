import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantApplication } from '../../merchant-application/entities/merchant-application.entity';
import { UserRole } from '@app/lib';

@Injectable()
export class SalesOwnerGuard implements CanActivate {
    constructor(
        @InjectRepository(MerchantApplication)
        private appRepo: Repository<MerchantApplication>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const applicationId = request.params.id;

        if (user.role === UserRole.ADMIN || user.role === UserRole.REVIEWER) {
            return true;
        }

        const application = await this.appRepo.findOne({ where: { id: applicationId } });
        if (!application) return false;

        if (application.createdById !== user.sub) {
            throw new ForbiddenException('You cannot access or modify another user\'s application.');
        }

        return true;
    }
}