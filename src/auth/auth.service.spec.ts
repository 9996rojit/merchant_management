import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthToken } from './entities/auth-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  const userService = { getUserSpecificField: jest.fn() };
  const jwtService = { signAsync: jest.fn() };
  const authTokenRepository = {
    create: jest.fn((token) => token),
    save: jest.fn(),
  };
  const configValues: Record<string, string> = {
    JWT_ACCESS_SECRET: Buffer.from('access-test-secret').toString('base64'),
    JWT_REFRESH_SECRET: Buffer.from('refresh-test-secret').toString('base64'),
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  };
  const configService = { get: jest.fn((key: string) => configValues[key]) };
  const userSalt = 'test-salt';
  let user: { id: string; email: string; role: string; salt: string; password: string };

  beforeEach(async () => {
    jest.clearAllMocks();
    authTokenRepository.create.mockImplementation((token) => token);
    authTokenRepository.save.mockResolvedValue(undefined);
    user = {
      id: 'e49f25e7-b516-4cf3-a8d1-f7bf301c18d5',
      email: 'sales@example.com',
      role: 'SALES',
      salt: userSalt,
      password: await bcrypt.hash(`correct-password${userSalt}`, 4),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(AuthToken), useValue: authTokenRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns a token pair for valid credentials', async () => {
    userService.getUserSpecificField.mockResolvedValue(user);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(service.login({ email: user.email, password: 'correct-password' })).resolves.toEqual({
      message: 'auth.login_successfully',
      tokenPair: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });

    expect(userService.getUserSpecificField).toHaveBeenCalledWith(user.email);
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ sub: user.id, email: user.email, role: user.role }),
      expect.objectContaining({ secret: 'access-test-secret', expiresIn: '15m' }),
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: user.id },
      expect.objectContaining({ secret: 'refresh-test-secret', expiresIn: '7d' }),
    );
  });

  it('rejects when the user does not exist', async () => {
    userService.getUserSpecificField.mockResolvedValue(false);

    await expect(service.login({ email: 'missing@example.com', password: 'password' }))
      .rejects.toThrow(new BadRequestException('auth.invalid_credentials'));
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects when the password is incorrect', async () => {
    userService.getUserSpecificField.mockResolvedValue(user);

    await expect(service.login({ email: user.email, password: 'wrong-password' }))
      .rejects.toThrow(new BadRequestException('auth.invalid_credentials'));
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
