export interface CachePort {
    get<T = any>(key: string): Promise<T | null>;
    mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    set<T = any>(key: string, val: T, ttlSec?: number): Promise<void>;
    del(keys: string | string[]): Promise<void>;
}