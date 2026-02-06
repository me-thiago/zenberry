import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { PrismaModule } from '../../infra/database/prisma.module';
import { ShopifyAuthModule } from '../auth/shopify/shopify-auth.module';

@Module({
    imports: [PrismaModule, ShopifyAuthModule],
    providers: [ProductsService],
    controllers: [ProductsController],
    exports: [ProductsService],
})
export class ProductsModule {}
