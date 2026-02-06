import {
    Controller,
    Get,
    Req,
    Logger,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiHeader,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UserDTO } from '../dto/user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) {
        this.logger.log('[Constructor] UsersController initialized');
    }

    @Get()
    @ApiOperation({
        summary: 'Get current user information',
        description: 'Retrieves complete information about the currently authenticated user, including workspace memberships and organization details.',
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
    @ApiResponse({
        status: 200,
        description: 'User information retrieved successfully',
        type: UserDTO,
        schema: {
            example: {
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
    async getUser(@Req() req: Request & { user: any }, @Res() res: Response): Promise<void> {
        const userId = req.user.id;
        this.logger.debug(`[getUser] Getting user info for: ${userId}`);
        const user = await this.usersService.findById(userId);
        res.status(200).json(user);
    }
}
