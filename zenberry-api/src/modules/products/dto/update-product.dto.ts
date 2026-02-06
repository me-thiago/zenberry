import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    IsNumber,
    IsPositive,
    Min,
} from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product name',
        example: 'Zenberry Energy Boost',
        required: false,
    })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product image URL',
        example: 'https://example.com/images/product.jpg',
        required: false,
    })
    image?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product description',
        example: 'A powerful energy supplement with natural ingredients',
        required: false,
    })
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Min(0.01)
    @IsOptional()
    @ApiProperty({
        description: 'Product price in dollars',
        example: 49.99,
        type: Number,
        required: false,
    })
    price?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product size',
        example: '500ml',
        required: false,
    })
    size?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product flavor',
        example: 'Berry Blast',
        required: false,
    })
    flavor?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiProperty({
        description: 'Product categories',
        example: ['Energy', 'Supplements', 'Natural'],
        type: [String],
        required: false,
    })
    categories?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @ApiProperty({
        description: 'Product effects',
        example: ['Increased Energy', 'Better Focus', 'Enhanced Mood'],
        type: [String],
        required: false,
    })
    effects?: string[];

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product benefits',
        example:
            'Provides sustained energy throughout the day without crashes',
        required: false,
    })
    benefits?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Product ingredients',
        example:
            'Natural berry extracts, caffeine, B vitamins, amino acids, natural sweeteners',
        required: false,
    })
    ingredients?: string;
}
