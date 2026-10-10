
import { IsString, IsNotEmpty, IsObject, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

class RequestedProcessingInfoDto {
    @ApiProperty({ example: 250000, description: 'Estimated monthly processing volume in USD.' })
    @IsNumber()
    estimatedMonthlyVolumeUSD: number;

    @ApiProperty({ example: 75, description: 'Average transaction amount in USD.' })
    @IsNumber()
    averageTicketSizeUSD: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    highRiskProducts: boolean;
}

export class CreateMerchantApplicationDto {
    @ApiProperty({ example: 'Northstar Coffee' })
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiProperty({ example: 'Northstar Coffee LLC' })
    @IsString()
    @IsNotEmpty()
    legalBusinessName: string;

    @ApiProperty({ example: 'Limited Liability Company' })
    @IsString()
    @IsNotEmpty()
    businessType: string;

    @ApiProperty({ example: 'Alex Rivera' })
    @IsString()
    @IsNotEmpty()
    ownerName: string;

    @ApiProperty({ example: 'alex@example.com' })
    @IsString()
    @IsNotEmpty()
    ownerEmail: string;

    @ApiProperty({ example: '+1-555-0100' })
    @IsString()
    @IsNotEmpty()
    ownerPhone: string;

    @ApiProperty({ type: RequestedProcessingInfoDto })
    @IsObject()
    @ValidateNested()
    @Type(() => RequestedProcessingInfoDto)
    requestedProcessingInfo: RequestedProcessingInfoDto;
}