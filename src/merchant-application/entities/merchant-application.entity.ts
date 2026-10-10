import { ApplicationStatus, BaseEntity, RiskStatus } from "@app/lib";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import type { Relation } from 'typeorm';
import { User } from "../../user/entities/user.entity";

@Entity('merchant_applications')
@Index(['businessName', 'status', 'riskStatus'])
export class MerchantApplication extends BaseEntity {
    @Column({ type: 'varchar', name: 'business_name' })
    businessName: string;

    @Column({ type: 'varchar', name: 'legal_business_name' })
    legalBusinessName: string;

    @Column({ type: 'varchar', name: 'business_type' })
    businessType: string;

    @Column({ type: 'varchar', name: 'owner_name' })
    ownerName: string;

    @Column({ type: 'varchar', name: 'owner_email' })
    ownerEmail: string;

    @Column({ type: 'varchar', name: 'owner_contact_number' })
    ownerContactNumber: string;

    @Column({ type: 'jsonb', nullable: true })
    requestedProcessingInfo: {
        estimatedMonthlyVolumeUSD: number;
        averageTicketSizeUSD: number;
        highRiskProducts: boolean;
    };

    @Column({ type: 'varchar', name: 'status' })
    status: ApplicationStatus;

    @Column({ type: 'varchar', name: 'risk_detail', nullable: true })
    riskDetail: string | null;

    @Column({ type: 'varchar', name: 'risk_status', default: RiskStatus.PENDING })
    riskStatus: RiskStatus;

    @Column({ type: 'uuid', name: 'created_by_id' })
    createdById: string;

    @ManyToOne(() => User, (user) => user.createdApplications, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: Relation<User>;

    @Column({ type: 'uuid', nullable: true, name: 'assigned_reviewer_id' })
    assignedReviewerId: string;

    @ManyToOne(() => User, (user) => user.assignedApplications, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assigned_reviewer_id' })
    assignedReviewer: Relation<User>;
}
