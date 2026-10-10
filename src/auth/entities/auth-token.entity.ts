
import { BaseEntity } from "@app/lib";
import { Column, Entity, Index } from "typeorm";

@Entity('auth_tokens')
@Index(['userId'])
@Index(['jti'], { unique: true })
export class AuthToken extends BaseEntity {

    @Column({ type: 'varchar', name: 'jti' })
    jti: string;

    @Column({ type: 'varchar', name: 'type' })
    type: string;

    @Column({ type: 'timestamp', name: 'expires_at' })
    expiresAt: Date;

    @Column({ type: 'varchar', name: 'user_id' })
    userId: string;
}
