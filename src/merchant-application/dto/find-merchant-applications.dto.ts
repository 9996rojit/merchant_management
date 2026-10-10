import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationDto, ApplicationStatus } from '@app/lib';
import { IsEnum, IsOptional } from 'class-validator';

export class FindMerchantApplicationsDto extends BasePaginationDto {
    @ApiPropertyOptional({ enum: ApplicationStatus })
    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;
}