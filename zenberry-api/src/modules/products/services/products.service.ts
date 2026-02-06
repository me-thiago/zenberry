import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * @param query - Query parameters for pagination
     * @returns Array of products
     */
    async findAll(
        query: QueryProductDto,
    ): Promise<Product[]> {
        this.logger.debug(
            `[findAll] Finding products, take: ${query.take}, skip: ${query.skip}`,
        );

        try {
            const products = await this.prisma.product.findMany({
                take: query.take,
                skip: query.skip,
                orderBy: { createdAt: 'desc' },
            });

            this.logger.debug(
                `[findAll] Found ${products.length} products`,
            );
            return products;
        } catch (error) {
            this.logger.error(
                `[findAll] Error finding products: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Error fetching products');
        }
    }

    /**
     * Finds a product by ID and validates ownership
     * @param productId - The product ID to find
     * @throws NotFoundException if product does not exist
     */
    async findOneById(
        productId: string,
    ): Promise<Product> {
        this.logger.debug(
            `[findOneById] Finding product: ${productId}`,
        );

        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            this.logger.error(
                `[findOneById] Product not found: ${productId}`,
            );
            throw new NotFoundException('Product not found');
        }

        this.logger.debug(
            `[findOneById] Product found`,
        );
        return product;
    }

    /**
     * Counts total products for a user
     * @returns Total count of products
     */
    async countAll(): Promise<number> {
        this.logger.debug(`[countAll] Counting all products`);

        try {
            const count = await this.prisma.product.count();

            this.logger.debug(`[countAll] Total products: ${count}`);
            return count;
        } catch (error) {
            this.logger.error(
                `[countAll] Error counting products: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Error counting products');
        }
    }

    /**
     * Creates a new product for the authenticated user
     * @param createProductDto - Product data to create
     * @returns The created product
     * @throws InternalServerErrorException if creation fails
     */
    async create(
        createProductDto: CreateProductDto,
    ): Promise<Product> {
        this.logger.debug(
            `[create] Creating product, name: ${createProductDto.name}`,
        );

        try {
            const product = await this.prisma.product.create({
                data: {
                    ...createProductDto,
                    price: new Decimal(createProductDto.price),
                    categories: createProductDto.categories || [],
                    effects: createProductDto.effects || [],
                },
            });

            this.logger.debug(
                `[create] Product created successfully: ${product.id}`,
            );
            return product;
        } catch (error) {
            this.logger.error(
                `[create] Error creating product: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Error creating product');
        }
    }

    /**
     * Updates a product by ID
     * @param updateProductDto - Updated product data
     * @returns The updated product
     * @throws NotFoundException if product does not exist
     * @throws ForbiddenException if user is not the owner
     */
    async update(
        productId: string,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        this.logger.debug(
            `[update] Updating product: ${productId}`,
        );

        // Validate ownership first
        await this.findOneById(productId);

        try {
            const updateData: any = { ...updateProductDto };

            // Convert price to Decimal if provided
            if (updateProductDto.price !== undefined) {
                updateData.price = new Decimal(updateProductDto.price);
            }

            const product = await this.prisma.product.update({
                where: { id: productId },
                data: updateData,
            });

            this.logger.debug(
                `[update] Product updated successfully: ${product.id}`,
            );
            return product;
        } catch (error) {
            this.logger.error(
                `[update] Error updating product: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Error updating product');
        }
    }

    /**
     * Deletes a product by ID
     * @param productId - The product ID to delete
     * @throws NotFoundException if product does not exist
     * @throws ForbiddenException if user is not the owner
     */
    async delete(productId: string): Promise<void> {
        this.logger.debug(
            `[delete] Deleting product: ${productId}`,
        );

        // Validate ownership first
        await this.findOneById(productId);

        try {
            await this.prisma.product.delete({
                where: { id: productId },
            });

            this.logger.debug(
                `[delete] Product deleted successfully: ${productId}`,
            );
        } catch (error) {
            this.logger.error(
                `[delete] Error deleting product: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Error deleting product');
        }
    }
}
