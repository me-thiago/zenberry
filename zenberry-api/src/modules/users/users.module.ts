import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { PrismaModule } from '../../infra/database/prisma.module';
import { UsersSettingsService } from './services/settings.service';
import { UsersSettingsController } from './controllers/settings.controller';
import { ShopifyAuthModule } from '../auth/shopify/shopify-auth.module';

@Module({
    imports: [PrismaModule, ShopifyAuthModule],
    providers: [UsersService, UsersSettingsService],
    controllers: [UsersController, UsersSettingsController],
    exports: [UsersService, UsersSettingsService],
})
export class UsersModule {}
