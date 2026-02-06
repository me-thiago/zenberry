import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the product',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Product name',
        example: 'Zenberry Energy Boost',
    })
    name: string;

    @ApiProperty({
        description: 'Product image URL',
        example: 'https://example.com/images/product.jpg',
        nullable: true,
    })
    image: string | null;

    @ApiProperty({
        description: 'Product description',
        example: 'A powerful energy supplement with natural ingredients',
        nullable: true,
    })
    description: string | null;

    @ApiProperty({
        description: 'Product price in dollars',
        example: 49.99,
        type: Number,
    })
    price: number;

    @ApiProperty({
        description: 'Product size',
        example: '500ml',
        nullable: true,
    })
    size: string | null;

    @ApiProperty({
        description: 'Product flavor',
        example: 'Berry Blast',
        nullable: true,
    })
    flavor: string | null;

    @ApiProperty({
        description: 'Product categories',
        example: ['Energy', 'Supplements', 'Natural'],
        type: [String],
    })
    categories: string[];

    @ApiProperty({
        description: 'Product effects',
        example: ['Increased Energy', 'Better Focus', 'Enhanced Mood'],
        type: [String],
    })
    effects: string[];

    @ApiProperty({
        description: 'Product benefits',
        example:
            'Provides sustained energy throughout the day without crashes',
        nullable: true,
    })
    benefits: string | null;

    @ApiProperty({
        description: 'Product ingredients',
        example:
            'Natural berry extracts, caffeine, B vitamins, amino acids, natural sweeteners',
        nullable: true,
    })
    ingredients: string | null;

    @ApiProperty({
        description: 'Date when the product was created',
        example: '2023-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the product was last updated',
        example: '2023-01-02T00:00:00.000Z',
    })
    updatedAt: Date;
}
