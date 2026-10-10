import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserSeeder } from './seeders';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserSeeder],
})
export class DatabaseModule { }