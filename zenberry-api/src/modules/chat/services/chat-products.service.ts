import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopifyClientService } from '../../../common/shopify/shopify-client.service';

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: string;
  available: boolean;
  tags: string[];
  productType: string;
  handle: string;
  url: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    available: boolean;
  }>;
}

/**
 * ChatProductsService
 * 
 * Serviço responsável por buscar produtos do Shopify para o chatbot
 */
@Injectable()
export class ChatProductsService {
  private readonly logger = new Logger(ChatProductsService.name);
  private productsCache: ProductInfo[] = [];
  private lastCacheTime: number = 0;
  private readonly CACHE_TTL = 300000; // 5 minutos

  constructor(
    private readonly shopifyClient: ShopifyClientService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Busca todos os produtos do Shopify
   */
  async getAllProducts(): Promise<ProductInfo[]> {
    const now = Date.now();
    
    // Retorna cache se ainda válido
    if (this.productsCache.length > 0 && (now - this.lastCacheTime) < this.CACHE_TTL) {
      return this.productsCache;
    }
    try {
      const query = `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                tags
                productType
                handle
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const result = await this.shopifyClient.query<any>(query, { first: 50 });

      const frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

      this.productsCache = result.products.edges.map((edge: any) => {
        const handle = edge.node.handle;
        const productUrl = `${frontendUrl}/products/${handle}`;

        return {
          id: edge.node.id,
          title: edge.node.title,
          description: edge.node.description || '',
          price: `${edge.node.priceRange.minVariantPrice.currencyCode} ${parseFloat(edge.node.priceRange.minVariantPrice.amount).toFixed(2)}`,
          available: edge.node.availableForSale,
          tags: edge.node.tags || [],
          productType: edge.node.productType || '',
          handle,
          url: productUrl,
          variants: edge.node.variants.edges.map((v: any) => ({
            id: v.node.id,
            title: v.node.title,
            price: `${v.node.price.currencyCode} ${parseFloat(v.node.price.amount).toFixed(2)}`,
            available: v.node.availableForSale,
          })),
        };
      });

      this.lastCacheTime = now;

      return this.productsCache;
    } catch (error) {
      this.logger.error(`Error fetching products from Shopify: ${error.message}`, error.stack);
      
      // Retorna cache antigo se houver erro
      if (this.productsCache.length > 0) {
        return this.productsCache;
      }
      
      return [];
    }
  }

  /**
   * Busca produtos por palavras-chave
   */
  async searchProducts(keywords: string): Promise<string> {
    try {
      const products = await this.getAllProducts();
      
      if (products.length === 0) {
        return 'Nenhum produto disponível no momento.';
      }

      const lowerKeywords = keywords.toLowerCase();
      const keywordsList = lowerKeywords.split(/\s+/);

      // Filtra produtos relevantes
      const relevantProducts = products.filter(product => {
        const searchableText = `
          ${product.title} 
          ${product.description} 
          ${product.tags.join(' ')}
        `.toLowerCase();

        return keywordsList.some(keyword => searchableText.includes(keyword));
      });

      if (relevantProducts.length === 0) {
        return `Nenhum produto encontrado para: "${keywords}". Temos ${products.length} produtos disponíveis. Posso te mostrar nosso catálogo completo?`;
      }

      // Formata resultado
      const result = relevantProducts.slice(0, 5).map(product => {
        const variants = product.variants.length > 1 
          ? `\n  Variações: ${product.variants.map(v => `${v.title} - ${v.price}`).join(', ')}`
          : '';

        return `
📦 ${product.title}
   Preço: ${product.price}
   ${product.available ? '✅ Disponível' : '❌ Indisponível'}
   🔗 Link: ${product.url}
   ${product.description.substring(0, 150)}${product.description.length > 150 ? '...' : ''}${variants}
   Tags: ${product.tags.join(', ')}
        `.trim();
      }).join('\n\n---\n\n');

      const summary = relevantProducts.length > 5 
        ? `\n\n💡 Encontrei ${relevantProducts.length} produtos, mostrando os 5 primeiros.`
        : '';

      return `${result}${summary}`;
    } catch (error) {
      this.logger.error(`Error in searchProducts: ${error.message}`, error.stack);
      return 'Erro ao buscar produtos. Por favor, tente novamente.';
    }
  }

  /**
   * Busca produto por ID
   */
  async getProductById(productId: string): Promise<ProductInfo | null> {
    const products = await this.getAllProducts();
    return products.find(p => p.id === productId) || null;
  }

  /**
   * Lista produtos por categoria/tag
   */
  async getProductsByTag(tag: string): Promise<ProductInfo[]> {
    const products = await this.getAllProducts();
    const lowerTag = tag.toLowerCase();
    
    return products.filter(p => 
      p.tags.some(t => t.toLowerCase().includes(lowerTag))
    );
  }

  /**
   * Limpa o cache manualmente
   */
  clearCache(): void {
    this.productsCache = [];
    this.lastCacheTime = 0;
    this.logger.log('Products cache cleared');
  }

  /**
   * Retorna informações do cache
   */
  getCacheInfo() {
    return {
      productsCount: this.productsCache.length,
      lastUpdate: this.lastCacheTime ? new Date(this.lastCacheTime) : null,
      isStale: (Date.now() - this.lastCacheTime) > this.CACHE_TTL,
    };
  }
}
