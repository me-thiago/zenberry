import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Logger,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ShopifyJwtGuard } from '../../auth/shopify/guards/shopify-jwt.guard';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiForbiddenResponse,
    ApiParam,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { QueryProductDto } from '../dto/query-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private readonly productsService: ProductsService) {
        this.logger.log('[Constructor] ProductsController initialized');
    }

    @Get()
    @ApiOperation({
        summary: 'List all products for the authenticated user',
        description:
            'Retrieves a paginated list of products owned by the current user.',
    })
    @ApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
        type: [ProductResponseDto],
        schema: {
            example: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Zenberry Energy Boost',
                    image: 'https://example.com/images/product.jpg',
                    description:
                        'A powerful energy supplement with natural ingredients',
                    price: 49.99,
                    size: '500ml',
                    flavor: 'Berry Blast',
                    categories: ['Energy', 'Supplements', 'Natural'],
                    effects: [
                        'Increased Energy',
                        'Better Focus',
                        'Enhanced Mood',
                    ],
                    benefits:
                        'Provides sustained energy throughout the day without crashes',
                    ingredients:
                        'Natural berry extracts, caffeine, B vitamins, amino acids, natural sweeteners',
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-02T00:00:00.000Z',
                },
            ],
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication failed - invalid or missing token',
        schema: {
            example: {
                statusCode: 401,
                message: 'Invalid Shopify auth token',
                error: 'Unauthorized',
            },
        },
    })
    async list(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a specific product by ID',
        description:
            'Retrieves detailed information about a specific product. Only the owner can access their products.',
    })
    @ApiParam({
        name: 'id',
        description: 'Product ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Product retrieved successfully',
        type: ProductResponseDto,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Zenberry Energy Boost',
                image: 'https://example.com/images/product.jpg',
                description:
                    'A powerful energy supplement with natural ingredients',
                price: 49.99,
                size: '500ml',
                flavor: 'Berry Blast',
                categories: ['Energy', 'Supplements', 'Natural'],
                effects: [
                    'Increased Energy',
                    'Better Focus',
                    'Enhanced Mood',
                ],
                benefits:
                    'Provides sustained energy throughout the day without crashes',
                ingredients:
                    'Natural berry extracts, caffeine, B vitamins, amino acids, natural sweeteners',
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-02T00:00:00.000Z',
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication failed',
        schema: {
            example: {
                statusCode: 401,
                message: 'Invalid Shopify auth token',
                error: 'Unauthorized',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Product not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Product not found',
                error: 'Not Found',
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'User does not have permission to access this product',
        schema: {
            example: {
                statusCode: 403,
                message: 'You do not have permission to access this product',
                error: 'Forbidden',
            },
        },
    })
    async findOne(@Param('id') id: string) {
        this.logger.debug(
            `[findOne] Getting product: ${id}`,
        );
        return this.productsService.findOneById(id);
    }

    @Post()
    @UseGuards(ShopifyJwtGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new product',
        description:
            'Creates a new product for the authenticated user. All required fields must be provided.',
    })
    @ApiResponse({
        status: 201,
        description: 'Product created successfully',
        type: ProductResponseDto,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Zenberry Energy Boost',
                image: 'https://example.com/images/product.jpg',
                description:
                    'A powerful energy supplement with natural ingredients',
                price: 49.99,
                size: '500ml',
                flavor: 'Berry Blast',
                categories: ['Energy', 'Supplements', 'Natural'],
                effects: [
                    'Increased Energy',
                    'Better Focus',
                    'Enhanced Mood',
                ],
                benefits:
                    'Provides sustained energy throughout the day without crashes',
                ingredients:
                    'Natural berry extracts, caffeine, B vitamins, amino acids, natural sweeteners',
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-02T00:00:00.000Z',
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication failed',
        schema: {
            example: {
                statusCode: 401,
                message: 'Invalid Shopify auth token',
                error: 'Unauthorized',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid request body - validation failed',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'name should not be empty',
                    'price must be a positive number',
                ],
                error: 'Bad Request',
            },
        },
    })
    async create(@Body() createProductDto: CreateProductDto) {
        this.logger.debug(
            `[create] Creating product, name: ${createProductDto.name}`,
        );
        return this.productsService.create(createProductDto);
    }

    @Patch(':id')
    @UseGuards(ShopifyJwtGuard)
    @ApiOperation({
        summary: 'Update a product',
        description:
            'Updates an existing product. Only the owner can update their products. All fields are optional.',
    })
    @ApiParam({
        name: 'id',
        description: 'Product ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 200,
        description: 'Product updated successfully',
        type: ProductResponseDto,
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Zenberry Energy Boost - Updated',
                image: 'https://example.com/images/product-new.jpg',
                description: 'An even more powerful energy supplement',
                price: 59.99,
                size: '750ml',
                flavor: 'Berry Explosion',
                categories: ['Energy', 'Supplements', 'Natural', 'Premium'],
                effects: [
                    'Increased Energy',
                    'Better Focus',
                    'Enhanced Mood',
                    'Improved Performance',
                ],
                benefits: 'Maximum sustained energy all day long',
                ingredients:
                    'Natural berry extracts, caffeine, B vitamins, amino acids, natural sweeteners, electrolytes',
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-03T00:00:00.000Z',
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication failed',
    })
    @ApiNotFoundResponse({
        description: 'Product not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Product not found',
                error: 'Not Found',
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'User does not have permission to update this product',
        schema: {
            example: {
                statusCode: 403,
                message: 'You do not have permission to access this product',
                error: 'Forbidden',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid request body - validation failed',
    })
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        this.logger.debug(
            `[update] Updating product: ${id}`,
        );
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(ShopifyJwtGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a product',
        description:
            'Deletes a product permanently. Only the owner can delete their products.',
    })
    @ApiParam({
        name: 'id',
        description: 'Product ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: 204,
        description: 'Product deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Authentication failed',
    })
    @ApiNotFoundResponse({
        description: 'Product not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'Product not found',
                error: 'Not Found',
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'User does not have permission to delete this product',
        schema: {
            example: {
                statusCode: 403,
                message: 'You do not have permission to access this product',
                error: 'Forbidden',
            },
        },
    })
    async delete(@Param('id') id: string) {
        this.logger.debug(
            `[delete] Deleting product: ${id}`,
        );
        await this.productsService.delete(id);
    }
}
