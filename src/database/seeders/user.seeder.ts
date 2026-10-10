import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@app/lib';
import { User } from '../../user/entities/user.entity';

const DEFAULT_USERS = [
    { email: 'admin@merchants.com', role: UserRole.ADMIN, password: 'Password123!' },
    { email: 'reviewer@merchants.com', role: UserRole.REVIEWER, password: 'Password123!' },
    { email: 'sales1@merchants.com', role: UserRole.SALES, password: 'Password123!' },
    { email: 'sales2@merchants.com', role: UserRole.SALES, password: 'Password123!' },
];

export async function seedUsers(userRepository: Repository<User>): Promise<string[]> {
    const seededEmails: string[] = [];

    for (const userData of DEFAULT_USERS) {
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });

        if (!existingUser) {
            const user = userRepository.create(userData);
            await userRepository.save(user);
            seededEmails.push(user.email);
        }
    }

    return seededEmails;
}

@Injectable()
export class UserSeeder implements OnApplicationBootstrap {
    private readonly logger = new Logger(UserSeeder.name)

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap() {
        if (this.configService.get<string>('NODE_ENV') !== 'development') {
            return;
        }
        const seededEmails = await seedUsers(this.userRepository);
        for (const email of seededEmails) {
            this.logger.log(`Seeded user with email: ${email}`);
        }
    }
}