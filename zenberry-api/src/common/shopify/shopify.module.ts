import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShopifyClientService } from './shopify-client.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ShopifyClientService],
  exports: [ShopifyClientService],
})
export class ShopifyModule {}
