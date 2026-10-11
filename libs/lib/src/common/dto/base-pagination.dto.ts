import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class BasePaginationDto {
    @ApiPropertyOptional({ type: Number, minimum: 1, default: 1, example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 10, example: 20 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 10;

    get offset(): number {
        return (this.page - 1) * this.limit;
    }
}
