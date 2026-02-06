import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { ShopifyClientService } from '../../../common/shopify/shopify-client.service';
import { RegisterShopifyDto } from './dto/register-shopify.dto';
import { LoginShopifyDto } from './dto/login-shopify.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ShopifyCustomerCreateResponse,
  ShopifyCustomerAccessTokenCreateResponse,
  ShopifyCustomerQueryResponse,
  ShopifyCustomerAccessTokenDeleteResponse,
  ShopifyCustomer,
} from './interfaces/shopify-customer.interface';

@Injectable()
export class ShopifyAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopifyClient: ShopifyClientService,
  ) {}

  /**
   * Creates a SHA-256 hash of the token for O(1) indexed lookup.
   * This avoids the O(N) bcrypt comparison on every auth request.
   */
  private hashTokenForLookup(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterShopifyDto) {
    // 1. Criar customer no Shopify
    const createMutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            phone
            acceptsMarketing
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const createResponse = await this.shopifyClient.query<ShopifyCustomerCreateResponse>(
      createMutation,
      {
        input: {
          email: dto.email,
          password: dto.password,
          firstName: dto.firstName,
          lastName: dto.lastName,
          ...(dto.phone && { phone: dto.phone }),
          acceptsMarketing: dto.acceptsMarketing || false,
        },
      },
    );

    if (createResponse.customerCreate.customerUserErrors.length > 0) {
      const error = createResponse.customerCreate.customerUserErrors[0];
      
      // Se for erro de rate limit, retornar mensagem mais clara
      if (error.message.includes('Limit exceeded') || error.message.includes('throttled')) {
        throw new BadRequestException('Shopify rate limit exceeded. Please wait a few minutes and try again.');
      }
      
      throw new BadRequestException(error.message);
    }

    const customer = createResponse.customerCreate.customer;
    if (!customer) {
      throw new BadRequestException('Failed to create customer');
    }

    // 2. Criar access token no Shopify
    const tokenMutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const tokenResponse = await this.shopifyClient.query<ShopifyCustomerAccessTokenCreateResponse>(
      tokenMutation,
      {
        input: {
          email: dto.email,
          password: dto.password,
        },
      },
    );

    if (tokenResponse.customerAccessTokenCreate.customerUserErrors.length > 0) {
      const error = tokenResponse.customerAccessTokenCreate.customerUserErrors[0];
      throw new BadRequestException(error.message);
    }

    const accessToken = tokenResponse.customerAccessTokenCreate.customerAccessToken;
    if (!accessToken) {
      throw new BadRequestException('Failed to create access token');
    }

    // 3. Salvar no banco com token criptografado + hash para lookup
    const hashedToken = await bcrypt.hash(accessToken.accessToken, 10);
    const tokenHash = this.hashTokenForLookup(accessToken.accessToken);

    await this.prisma.user.create({
      data: {
        shopifyCustomerId: customer.id,
        shopifyAccessToken: hashedToken,
        shopifyTokenHash: tokenHash,
        shopifyTokenExpiresAt: new Date(accessToken.expiresAt),
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        acceptsMarketing: customer.acceptsMarketing,
      },
    });

    return {
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        acceptsMarketing: customer.acceptsMarketing,
      },
    };
  }

  async login(dto: LoginShopifyDto) {
    // 1. Criar access token no Shopify
    const tokenMutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const tokenResponse = await this.shopifyClient.query<ShopifyCustomerAccessTokenCreateResponse>(
      tokenMutation,
      {
        input: {
          email: dto.email,
          password: dto.password,
        },
      },
    );

    if (tokenResponse.customerAccessTokenCreate.customerUserErrors.length > 0) {
      const error = tokenResponse.customerAccessTokenCreate.customerUserErrors[0];
      throw new UnauthorizedException(error.message);
    }

    const accessToken = tokenResponse.customerAccessTokenCreate.customerAccessToken;
    if (!accessToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Buscar dados do customer no Shopify
    const customerData = await this.getCustomerFromShopify(accessToken.accessToken);

    // 3. Upsert no banco (criar se não existe, atualizar se existe)
    const hashedToken = await bcrypt.hash(accessToken.accessToken, 10);
    const tokenHash = this.hashTokenForLookup(accessToken.accessToken);

    await this.prisma.user.upsert({
      where: { shopifyCustomerId: customerData.id },
      create: {
        shopifyCustomerId: customerData.id,
        shopifyAccessToken: hashedToken,
        shopifyTokenHash: tokenHash,
        shopifyTokenExpiresAt: new Date(accessToken.expiresAt),
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        acceptsMarketing: customerData.acceptsMarketing,
      },
      update: {
        shopifyAccessToken: hashedToken,
        shopifyTokenHash: tokenHash,
        shopifyTokenExpiresAt: new Date(accessToken.expiresAt),
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        acceptsMarketing: customerData.acceptsMarketing,
      },
    });

    return {
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
      customer: customerData,
    };
  }

  async getCurrentCustomer(token: string) {
    // 1. O(1) lookup by SHA-256 hash (indexed column)
    const tokenHash = this.hashTokenForLookup(token);

    const user = await this.prisma.user.findFirst({
      where: {
        shopifyTokenHash: tokenHash,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // 2. Verificar se token não expirou
    if (user.shopifyTokenExpiresAt && new Date() > user.shopifyTokenExpiresAt) {
      throw new UnauthorizedException('Token expired');
    }

    // 3. Buscar dados atualizados do Shopify
    const customerData = await this.getCustomerFromShopify(token);

    return {
      id: user.id,
      shopifyCustomerId: user.shopifyCustomerId,
      email: customerData.email,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      acceptsMarketing: customerData.acceptsMarketing,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout(token: string) {
    // 1. O(1) lookup by SHA-256 hash (indexed column)
    const tokenHash = this.hashTokenForLookup(token);

    const user = await this.prisma.user.findFirst({
      where: {
        shopifyTokenHash: tokenHash,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Deletar token no Shopify
    const deleteMutation = `
      mutation customerAccessTokenDelete($customerAccessToken: String!) {
        customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
          deletedAccessToken
          deletedCustomerAccessTokenId
          userErrors {
            field
            message
          }
        }
      }
    `;

    await this.shopifyClient.query<ShopifyCustomerAccessTokenDeleteResponse>(
      deleteMutation,
      {
        customerAccessToken: token,
      },
    );

    // 3. Limpar token no banco
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        shopifyAccessToken: null,
        shopifyTokenHash: null,
        shopifyTokenExpiresAt: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async getCustomerFromShopify(token: string): Promise<ShopifyCustomer> {
    const customerQuery = `
      query customer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          email
          firstName
          lastName
          phone
          acceptsMarketing
        }
      }
    `;

    const response = await this.shopifyClient.query<ShopifyCustomerQueryResponse>(
      customerQuery,
      { customerAccessToken: token },
    );

    if (!response.customer) {
      throw new UnauthorizedException('Invalid token');
    }

    return response.customer;
  }
}
