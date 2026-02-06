import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from './infra/database/prisma.module';
import { RequestContextMiddleware } from './common/http/middlewares/request-context.middleware';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './common/env/env.schema';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { ShopifyModule } from './common/shopify/shopify.module';
import { ShopifyAuthModule } from './modules/auth/shopify/shopify-auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { ChatModule } from './modules/chat/chat.module';
import { ContextModule } from './modules/context/context.module';

@Module({
  imports: [
    ClsModule.forRoot({ global: true }),

    //Guards
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 30000, // 30 seconds
          limit: 30, // the maximum number of requests within the ttl
        },
      ],
    }),

    // Core modules
    PrismaModule,

    ConfigModule.forRoot({
      validate: (config: Record<string, unknown>) => EnvSchema.parse(config),
    }),

    // Schedule and Tasks
    ScheduleModule.forRoot(),

    // File handling
    MulterModule.register({
      dest: './uploads',
    }),

    // Application modules
    ShopifyModule,
    ShopifyAuthModule,
    UsersModule,
    ProductsModule,
    ContextModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
