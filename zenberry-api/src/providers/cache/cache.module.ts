import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheAdapter } from './drivers/redis.cache.adapter';
import { TOKENS } from '../../common/injection-tokens';

type Driver = 'redis';

@Module({})
export class CacheModule {
  static register(driver: Driver = 'redis'): DynamicModule {
    const provider = {
      provide: TOKENS.CACHE,
      useClass: RedisCacheAdapter, // único por enquanto
    };
    return {
      module: CacheModule,
      imports: [ConfigModule],
      providers: [provider],
      exports: [provider]
    };
  }
}