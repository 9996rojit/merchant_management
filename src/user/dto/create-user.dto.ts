import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@app/lib';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'sales@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPassword123!', minLength: 8, writeOnly: true })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.SALES })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}
