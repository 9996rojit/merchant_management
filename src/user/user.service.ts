import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';

type UserResponse = Pick<User, 'id' | 'email' | 'role' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) { }


  async create(dto: CreateUserDto): Promise<UserResponse> {
    const user = await this.userRepo.save(this.userRepo.create(dto));
    return this.toResponse(user);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepo.createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .getMany();
    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.role', 'user.createdAt', 'user.updatedAt'])
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const { password, ...userChanges } = dto;
    Object.assign(user, userChanges);
    if (password) {
      user.salt = randomBytes(16).toString('hex');
      user.password = await bcrypt.hash(password + user.salt, 10);
    }

    return this.toResponse(await this.userRepo.save(user));
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    await this.userRepo.softRemove(user);
  }

  async getUserSpecificField(email: string) {
    const user = await this.userRepo.createQueryBuilder('user')
      .addSelect(['user.id', 'user.password', 'user.salt', 'user.role'])
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .getOne()
    if (!user) return false
    return user
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
