
import { ApplicationStatus, type ApplicationDecision } from '@app/lib';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewMerchantApplicationDto {
    @ApiProperty({ enum: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.INFO_REQUIRED] })
    @ApiProperty({ example: 'Risk review passed.' })
    @IsString()
    @IsIn([
        ApplicationStatus.APPROVED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.INFO_REQUIRED,
    ])
    decision: ApplicationDecision;

    @IsString()
    @IsNotEmpty()
    reason: string;
}