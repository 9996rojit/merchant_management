import 'reflect-metadata';
import dataSource from './data-source';
import { seedUsers } from './seeders/user.seeder';
import { User } from '../user/entities/user.entity';

async function seedDatabase(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('The seed command is only available when NODE_ENV=development.');
    }

    await dataSource.initialize();

    try {
        const seededEmails = await seedUsers(dataSource.getRepository(User));
        console.log(`Seed complete. Added ${seededEmails.length} user(s).`);
        if (seededEmails.length > 0) {
            console.log(seededEmails.join('\n'));
        }
    } finally {
        await dataSource.destroy();
    }
}

seedDatabase().catch((error: unknown) => {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
});