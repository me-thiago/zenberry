import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShopifyClientService {
  private readonly apiUrl: string;
  private readonly accessToken: string;

  constructor(private configService: ConfigService) {
    const domain = this.configService.get('SHOPIFY_STORE_DOMAIN');
    this.apiUrl = `https://${domain}/api/2024-01/graphql.json`;
    this.accessToken = this.configService.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new HttpException(
        result.errors[0].message,
        400,
      );
    }

    return result.data;
  }
}
