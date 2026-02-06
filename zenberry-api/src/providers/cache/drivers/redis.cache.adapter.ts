import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CachePort } from '../cache.port';
import IORedis, { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class RedisCacheAdapter implements CachePort, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = this.createRedisClient();
    this.setupEventHandlers();
  }

  private createRedisClient(): Redis {
    const redisUrl = this.config.get<string>('REDIS_URL');
    
    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      enableAutoPipelining: true,
      lazyConnect: true,
      keepAlive: 30000,
      // Configurações para evitar Signal Aborted
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    return new IORedis(redisUrl, options);
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!key?.trim()) {
      this.logger.warn('Attempted to get cache with empty key');
      return null;
    }

    try {
      const raw = await this.client.get(key);
      return this.deserializeValue<T>(raw);
    } catch (error) {
      this.logger.error(`Error getting cache key "${key}":`, error);
      return null;
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!keys?.length) return [];

    const validKeys = keys.filter(key => key?.trim());
    if (validKeys.length !== keys.length) {
      this.logger.warn('Some keys were empty and filtered out');
    }

    if (!validKeys.length) return [];

    try {
      const rawValues = await this.client.mget(validKeys);
      return rawValues.map(raw => this.deserializeValue<T>(raw));
    } catch (error) {
      this.logger.error('Error getting multiple cache keys:', error);
      return keys.map(() => null);
    }
  }

  async set<T = any>(key: string, value: T, ttlSec?: number): Promise<void> {
    if (!key?.trim()) {
      this.logger.warn('Attempted to set cache with empty key');
      return;
    }

    if (value === undefined) {
      this.logger.warn(`Attempted to cache undefined value for key "${key}"`);
      return;
    }

    try {
      const serializedValue = this.serializeValue(value);
      
      if (this.isValidTtl(ttlSec)) {
        await this.client.setex(key, ttlSec!, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error(`Error setting cache key "${key}":`, error);
      throw error;
    }
  }

  async del(keys: string | string[]): Promise<void> {
    const keyList = Array.isArray(keys) ? keys : [keys];
    const validKeys = keyList.filter(key => key?.trim());
    
    if (!validKeys.length) {
      this.logger.warn('No valid keys provided for deletion');
      return;
    }

    try {
      await this.client.del(...validKeys);
    } catch (error) {
      this.logger.error('Error deleting cache keys:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!key?.trim()) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key "${key}":`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!key?.trim()) return -2;
    
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key "${key}":`, error);
      return -2;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.log('Cache flushed successfully');
    } catch (error) {
      this.logger.error('Error flushing cache:', error);
      throw error;
    }
  }

  private deserializeValue<T>(raw: string | null): T | null {
    if (!raw) return null;
    
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error('Error deserializing cached value:', error);
      return null;
    }
  }

  private serializeValue<T>(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      this.logger.error('Error serializing value:', error);
      throw new Error('Failed to serialize cache value');
    }
  }

  private isValidTtl(ttl?: number): ttl is number {
    return typeof ttl === 'number' && ttl > 0 && Number.isInteger(ttl);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  // Método para verificar saúde da conexão
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}