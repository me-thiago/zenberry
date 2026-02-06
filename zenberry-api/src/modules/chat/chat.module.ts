import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatAgent } from './chat.agent';
import { ContextModule } from '../context/context.module';
import { ShopifyModule } from '../../common/shopify/shopify.module';
import { ChatProductsService } from './services/chat-products.service';

@Module({
  imports: [ContextModule, ShopifyModule, ConfigModule],
  controllers: [ChatController],
  providers: [ChatService, ChatAgent, ChatProductsService],
  exports: [ChatService],
})
export class ChatModule {}
