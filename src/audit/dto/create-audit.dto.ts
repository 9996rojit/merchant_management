import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    actorId: string;

    @ApiProperty({ example: 'APPLICATION_CREATED', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    action: string;

    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    merchantApplicationId?: string;

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}
