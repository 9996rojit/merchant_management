
import { BaseEntity } from '@app/lib';
import { Entity, Column, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
    @Column({ type: 'uuid' })
    @Index()
    actorId: string;

    @Column({ type: 'varchar', length: 100 })
    action: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    merchantApplicationId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
}