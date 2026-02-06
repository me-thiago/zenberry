import {
    Controller,
    Body,
    Put,
    Req,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiHeader,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UpdateUserSettingsDTO, UpdateUserSettingsResponseDTO } from '../dto/user.dto';
import { UsersSettingsService } from '../services/settings.service';
import { ShopifyJwtGuard } from '../../auth/shopify/guards/shopify-jwt.guard';

@ApiTags('Users')
@Controller('users/settings')
export class UsersSettingsController {
    private readonly logger = new Logger(UsersSettingsController.name);

    constructor(private readonly usersSettingsService: UsersSettingsService) {
        this.logger.log('[Constructor] UsersSettingsController initialized');
    }

    @Put()
    @UseGuards(ShopifyJwtGuard)
    @ApiOperation({
        summary: 'Update user information',
        description: 'Updates the current user information such as email address. Returns the updated user information.',
    })
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Authorization',
        description: 'Bearer token for Shopify authentication',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
    })
    @ApiBody({
        type: UpdateUserSettingsDTO,
        description: 'User information to update',
        examples: {
            updateEmail: {
                summary: 'Update email address',
                description: 'Example updating user email address',
                value: {
                    email: 'newemail@example.com',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'User settings updated successfully',
        type: UpdateUserSettingsResponseDTO,
        schema: {
            example: {
                user: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    shopifyCustomerId: 'gid://shopify/Customer/123456',
                    email: 'user@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567890',
                    acceptsMarketing: true,
                    createdAt: '2023-01-01T00:00:00.000Z',
                    updatedAt: '2023-01-02T00:00:00.000Z',
                },
                message: 'User settings updated successfully',
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid request data or nickname already in use',
        schema: {
            examples: {
                emailInUse: {
                    summary: 'Email already in use',
                    value: {
                        statusCode: 400,
                        message: 'Email already in use',
                        error: 'Bad Request',
                    },
                },
                invalidData: {
                    summary: 'Invalid request data',
                    value: {
                        statusCode: 400,
                        message: ['email must be a valid email address'],
                        error: 'Bad Request',
                    },
                },
            },
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
    @ApiNotFoundResponse({
        description: 'User not found',
        schema: {
            example: {
                statusCode: 404,
                message: 'User not found',
                error: 'Not Found',
            },
        },
    })
    async updateUserSettings(
        @Req() req: Request & { user: any },
        @Body() data: UpdateUserSettingsDTO,
    ): Promise<UpdateUserSettingsResponseDTO> {
        const userId = req.user.id;
        const token = req.headers.authorization?.split(' ')[1];
        this.logger.debug(`[updateUserSettings] Updating settings for user: ${userId}`);
        return this.usersSettingsService.updateSettings(userId, data, token);
    }
}
  