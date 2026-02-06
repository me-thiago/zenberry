import { ApiProperty } from '@nestjs/swagger';

export class ShopifyAuthResponseDto {
  @ApiProperty({
    description: 'Shopify customer access token',
    example: 'abc123xyz456...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2025-12-04T16:42:00.000Z'
  })
  expiresAt: string;

  @ApiProperty({
    description: 'Customer information',
    example: {
      id: 'gid://shopify/Customer/123456789',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      acceptsMarketing: true
    }
  })
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    acceptsMarketing: boolean;
  };
}
