import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class QueryProductDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    @ApiProperty({
        description: 'Number of products to return (limit)',
        required: false,
        default: 20,
        minimum: 1,
        maximum: 100,
    })
    take?: number = 20;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({
        description: 'Number of products to skip (offset)',
        required: false,
        default: 0,
        minimum: 0,
    })
    skip?: number = 0;
}
