import { BaseEntity } from "@app/lib";
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { MerchantApplication } from "../../merchant-application/entities/merchant-application.entity";

@Entity('users')
export class User extends BaseEntity {

    @Column({ type: 'varchar', name: 'email', unique: true })
    email: string;

    @Column({ type: 'varchar', name: 'password', select: false })
    password: string;

    @Column({ type: 'varchar', name: 'role' })
    role: string;

    @Column({ type: 'varchar', name: 'salt', select: false })
    salt: string;

    @OneToMany(() => MerchantApplication, (application) => application.createdBy)
    createdApplications: MerchantApplication[];

    @OneToMany(() => MerchantApplication, (application) => application.assignedReviewer)
    assignedApplications: MerchantApplication[];

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {

            this.salt = crypto.randomBytes(16).toString("hex");
            const passwordWithSalt = this.password + this.salt;
            const saltRounds = 10
            this.password = await bcrypt.hash(passwordWithSalt, saltRounds);
        }

        this.email = this.email.toLowerCase().trim();
    }
}
