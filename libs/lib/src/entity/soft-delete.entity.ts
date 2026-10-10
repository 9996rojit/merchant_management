import { DeleteDateColumn } from "typeorm";

export class SoftDeleteEntity {
    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
    deletedAt: Date
}