import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infra/database/prisma.service';
import { ShopifyClientService } from '../../../common/shopify/shopify-client.service';
import { UpdateUserSettingsDTO, UpdateUserSettingsResponseDTO } from '../dto/user.dto';

@Injectable()
export class UsersSettingsService {
    private readonly logger = new Logger(UsersSettingsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly shopifyClient: ShopifyClientService,
    ) {}

    /**
     * Updates user information and returns the updated user
     * @param {string} id - The user id to update
     * @param {UpdateUserSettingsDTO} data - The user data to update
     * @returns {Promise<UpdateUserSettingsResponseDTO>} The updated user with success message
     */
    async updateSettings(
        id: string,
        body: UpdateUserSettingsDTO,
        customerAccessToken: string,
    ): Promise<UpdateUserSettingsResponseDTO> {
        this.logger.debug(`[updateSettings] Updating user information for user: ${id}`);

        if (!customerAccessToken) {
            throw new BadRequestException('Missing Shopify auth token');
        }

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            this.logger.error(`[updateSettings] User not found: ${id}`);
            throw new NotFoundException('User not found');
        }

        // Check if email is already taken by another user
        if (body.email) {
            const userWithEmail = await this.prisma.user.findFirst({
                where: {
                    email: body.email,
                    NOT: { id },
                },
            });

            if (userWithEmail) {
                this.logger.error(`[updateSettings] Email already in use: ${body.email}`);
                throw new BadRequestException('Email already in use');
            }
        }

        // Build Shopify customer update input with provided fields only
        const customerInput: Record<string, unknown> = {};
        if (body.firstName !== undefined) customerInput.firstName = body.firstName;
        if (body.lastName !== undefined) customerInput.lastName = body.lastName;
        if (body.email !== undefined) customerInput.email = body.email;
        // Only include phone if it has a value (not empty string)
        if (body.phone !== undefined && body.phone && body.phone.trim() !== '') {
            customerInput.phone = body.phone;
        }
        if (body.acceptsMarketing !== undefined) customerInput.acceptsMarketing = body.acceptsMarketing;

        if (Object.keys(customerInput).length === 0) {
            throw new BadRequestException('No fields to update');
        }

        const customerUpdateMutation = `
          mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
            customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
              customer {
                id
                email
                firstName
                lastName
                phone
                acceptsMarketing
              }
              customerAccessToken {
                accessToken
                expiresAt
              }
              customerUserErrors {
                field
                message
                code
              }
            }
          }
        `;

        const shopifyResponse = await this.shopifyClient.query<any>(customerUpdateMutation, {
            customerAccessToken,
            customer: customerInput,
        });

        const customerUpdate = shopifyResponse?.customerUpdate;
        const userErrors = customerUpdate?.customerUserErrors ?? [];

        if (userErrors.length > 0) {
            const error = userErrors[0];
            this.logger.error(`[updateSettings] Shopify error: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        const shopifyCustomer = customerUpdate?.customer;
        if (!shopifyCustomer) {
            throw new BadRequestException('Failed to update customer in Shopify');
        }

        // Handle potential token rotation returned by Shopify
        const rotatedToken = customerUpdate?.customerAccessToken?.accessToken as string | undefined;
        const rotatedExpiresAt = customerUpdate?.customerAccessToken?.expiresAt as string | undefined;

        const tokenToPersist = rotatedToken || customerAccessToken;
        const expiresToPersist = rotatedExpiresAt
            ? new Date(rotatedExpiresAt)
            : existingUser.shopifyTokenExpiresAt ?? null;

        // Update local user record with latest data and token (hashed)
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                email: shopifyCustomer.email,
                firstName: shopifyCustomer.firstName,
                lastName: shopifyCustomer.lastName,
                phone: shopifyCustomer.phone,
                acceptsMarketing: shopifyCustomer.acceptsMarketing,
                shopifyAccessToken: tokenToPersist
                    ? await bcrypt.hash(tokenToPersist, 10)
                    : existingUser.shopifyAccessToken,
                shopifyTokenExpiresAt: expiresToPersist,
            },
        });

        this.logger.debug(`[updateSettings] User information updated successfully for: ${updatedUser.email}`);

        return {
            customer: {
                id: shopifyCustomer.id,
                email: shopifyCustomer.email,
                firstName: shopifyCustomer.firstName,
                lastName: shopifyCustomer.lastName,
                phone: shopifyCustomer.phone,
                acceptsMarketing: shopifyCustomer.acceptsMarketing,
            },
            message: 'User settings updated successfully',
            accessToken: rotatedToken,
            expiresAt: rotatedExpiresAt,
        };
    }
}
  