import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from './entities/auth-token.entity';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private privateKey: string;
  private publicKey: string;
  private accessTokenTime: string;
  private refreshTokenTime: string;
  private refreshTokenExpTimeInNumber: number

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(AuthToken) private readonly authTokenRepo: Repository<AuthToken>
  ) {
    this.privateKey = Buffer.from(this.configService.get('JWT_REFRESH_SECRET') as string, 'base64').toString('utf-8');
    this.publicKey = Buffer.from(this.configService.get('JWT_ACCESS_SECRET') as string, 'base64').toString('utf-8');
    this.accessTokenTime = this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.refreshTokenTime = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
    this.refreshTokenExpTimeInNumber = this.configService.get('JWT_REFRESH_TIME_IN_NUMBER') || 7;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.getUserSpecificField(dto.email);
    if (!user) {
      throw new BadRequestException("auth.invalid_credentials")
    }
    const constructedPassword = dto.password + user.salt;
    const isMatch = await bcrypt.compare(constructedPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('auth.invalid_credentials')
    }
    const tokenPair = await this.generateTokenPair(user);

    return {
      message: 'auth.login_successfully',
      tokenPair
    };
  }

  async generateTokenPair(user: { id: string; role: string; email: string }) {
    const jti = randomUUID();
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, jti, email: user.email, role: user.role },
      {
        secret: this.privateKey,
        algorithm: 'RS256',
        expiresIn: this.accessTokenTime as JwtSignOptions['expiresIn'],
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.privateKey,
        algorithm: 'RS256',
        expiresIn: this.refreshTokenTime as JwtSignOptions['expiresIn'],
        jwtid: jti,
      },
    );

    await this.authTokenRepo.save(
      this.authTokenRepo.create({
        jti,
        type: 'refresh',
        expiresAt: new Date(Date.now() + this.refreshTokenExpTimeInNumber * 1000),
        userId: user.id,
      }),
    );

    return { accessToken, refreshToken }

  }
}
