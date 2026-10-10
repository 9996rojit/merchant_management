import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AuditLog } from '../audit/entities/audit.entity';
import { AuthToken } from '../auth/entities/auth-token.entity';
import { MerchantApplication } from '../merchant-application/entities/merchant-application.entity';
import { User } from '../user/entities/user.entity';

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, MerchantApplication, AuditLog, AuthToken],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
});