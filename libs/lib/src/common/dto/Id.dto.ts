import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from "class-validator";

export class IdDto {
    @ApiProperty({ format: 'uuid', example: 'a3f8b6b4-15c3-4f1e-8f6a-8d48f8549e3b' })
    @IsUUID()
    @IsNotEmpty()
    id: string
}