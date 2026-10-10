import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        const accessSecret = Buffer.from(
            configService.get<string>('JWT_ACCESS_SECRET') || '',
            'base64',
        ).toString('utf-8');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: accessSecret,
        });
    }

    async validate(payload: { sub: string; email: string; role: string }) {
        if (!payload || !payload.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }

        return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}