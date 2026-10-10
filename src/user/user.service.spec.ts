import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '@app/lib';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
  };
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };
  const createUser = (): User => ({
    id: 'e49f25e7-b516-4cf3-a8d1-f7bf301c18d5',
    email: 'sales@example.com',
    role: 'SALES',
    password: 'hashed-password',
    salt: 'existing-salt',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  } as User);
  let user: User;
  let userResponse: {
    id: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    user = createUser();
    userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: getRepositoryToken(User), useValue: repository }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('creates a user and omits credentials from the response', async () => {
    const dto: CreateUserDto = { email: user.email, password: 'secret-pass', role: UserRole.SALES };
    repository.create.mockReturnValue(user);
    repository.save.mockResolvedValue(user);

    await expect(service.create(dto)).resolves.toEqual(userResponse);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(user);
  });

  it('lists users in creation order and returns safe user fields', async () => {
    queryBuilder.getMany.mockResolvedValue([user]);

    await expect(service.findAll()).resolves.toEqual([userResponse]);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
  });

  it('returns a user by ID', async () => {
    queryBuilder.getOne.mockResolvedValue(user);

    await expect(service.findOne(user.id)).resolves.toEqual(userResponse);
    expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id: user.id });
  });

  it('throws when the requested user does not exist', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(service.findOne(user.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a user and re-hashes a changed password', async () => {
    repository.findOne.mockResolvedValue(user);
    repository.save.mockResolvedValue(user);
    const dto: UpdateUserDto = { email: 'updated@example.com', password: 'new-password' };

    const result = await service.update(user.id, dto);

    expect(result.email).toBe('updated@example.com');
    expect(user.salt).not.toBe('existing-salt');
    await expect(bcrypt.compare(`new-password${user.salt}`, user.password)).resolves.toBe(true);
    expect(result).not.toHaveProperty('password');
  });

  it('throws when updating a missing user', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.update(user.id, {})).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('soft-deletes an existing user', async () => {
    repository.findOne.mockResolvedValue(user);
    repository.softRemove.mockResolvedValue(user);

    await expect(service.remove(user.id)).resolves.toBeUndefined();
    expect(repository.softRemove).toHaveBeenCalledWith(user);
  });

  it('throws when deleting a missing user', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.remove(user.id)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.softRemove).not.toHaveBeenCalled();
  });

  it('looks up credentials using a normalized email address', async () => {
    queryBuilder.getOne.mockResolvedValue(user);

    await expect(service.getUserSpecificField(' SALES@EXAMPLE.COM ')).resolves.toBe(user);
    expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email: 'sales@example.com' });
  });

  it('returns false when no credentials match the email address', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(service.getUserSpecificField('missing@example.com')).resolves.toBe(false);
  });
});
