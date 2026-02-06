import { Module } from '@nestjs/common';
import { ShopifyAuthController } from './shopify-auth.controller';
import { ShopifyAuthService } from './shopify-auth.service';
import { ShopifyJwtGuard } from './guards/shopify-jwt.guard';
import { PrismaModule } from '../../../infra/database/prisma.module';
import { ShopifyModule } from '../../../common/shopify/shopify.module';

@Module({
  imports: [PrismaModule, ShopifyModule],
  controllers: [ShopifyAuthController],
  providers: [ShopifyAuthService, ShopifyJwtGuard],
  exports: [ShopifyAuthService, ShopifyJwtGuard],
})
export class ShopifyAuthModule {}
