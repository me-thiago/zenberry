import { z } from 'zod';

export const EnvSchema = z.object({
  // Core
  DATABASE_URL: z.string().url(),
  API_URL: z.string().url(),
  APP_URL: z.string().url(),
  PORT: z.string().min(1).default('8080'),
  ENVIRONMENT: z.enum(['LOCAL', 'DEVELOPMENT', 'STAGING', 'PRODUCTION']).default('LOCAL'),

  // Shopify
  SHOPIFY_STORE_DOMAIN: z.string().min(1),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
  SHOPIFY_API_VERSION: z.string().default('2024-01'),

  // Encryption
  GENERAL_ENCRYPTION_SECRET: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
