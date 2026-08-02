import type { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

type ThrottlerStorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

type MemoryRecord = {
  hits: number[];
  blockedUntil: number;
};

export class ThrottlerStorageRedisService implements ThrottlerStorage {
  private readonly fallbackRecords = new Map<string, MemoryRecord>();

  constructor(private readonly redisClient: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const now = Date.now();
    const hitKey = this.getHitKey(key, throttlerName);
    const blockKey = this.getBlockKey(key, throttlerName);
    const member = `${now}:${Math.random()}`;

    try {
      const result = (await this.redisClient.eval(
        `
      local hitKey = KEYS[1]
      local blockKey = KEYS[2]
      local now = tonumber(ARGV[1])
      local ttl = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local blockDuration = tonumber(ARGV[4])
      local member = ARGV[5]

      local blockTtl = redis.call('PTTL', blockKey)
      if blockTtl > 0 then
        local totalHits = redis.call('ZCARD', hitKey)
        local hitTtl = redis.call('PTTL', hitKey)
        if hitTtl < 0 then
          hitTtl = 0
        end
        return { totalHits, hitTtl, 1, blockTtl }
      end

      redis.call('ZREMRANGEBYSCORE', hitKey, 0, now - ttl)
      redis.call('ZADD', hitKey, now, member)
      redis.call('PEXPIRE', hitKey, ttl)

      local totalHits = redis.call('ZCARD', hitKey)
      local hitTtl = redis.call('PTTL', hitKey)

      if totalHits > limit then
        redis.call('SET', blockKey, '1', 'PX', blockDuration)
        return { totalHits, hitTtl, 1, blockDuration }
      end

      return { totalHits, hitTtl, 0, 0 }
      `,
        2,
        hitKey,
        blockKey,
        now,
        ttl,
        limit,
        blockDuration,
        member,
      )) as [number, number, number, number];

      const [totalHits, timeToExpire, isBlocked, timeToBlockExpire] = result;

      return {
        totalHits,
        timeToExpire: this.millisecondsToSeconds(timeToExpire),
        isBlocked: isBlocked === 1,
        timeToBlockExpire: this.millisecondsToSeconds(timeToBlockExpire),
      };
    } catch {
      return this.incrementFallback(key, ttl, limit, blockDuration);
    }
  }

  private incrementFallback(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    const now = Date.now();
    const record = this.fallbackRecords.get(key) ?? {
      hits: [],
      blockedUntil: 0,
    };

    if (record.blockedUntil > now) {
      return {
        totalHits: record.hits.length,
        timeToExpire: this.millisecondsToSeconds(
          this.getFallbackTimeToExpire(record.hits, ttl, now),
        ),
        isBlocked: true,
        timeToBlockExpire: this.millisecondsToSeconds(
          record.blockedUntil - now,
        ),
      };
    }

    const hits = record.hits.filter((hit) => hit > now - ttl);
    hits.push(now);

    const isBlocked = hits.length > limit;
    record.hits = hits;
    record.blockedUntil = isBlocked ? now + blockDuration : 0;
    this.fallbackRecords.set(key, record);

    return {
      totalHits: hits.length,
      timeToExpire: this.millisecondsToSeconds(
        this.getFallbackTimeToExpire(hits, ttl, now),
      ),
      isBlocked,
      timeToBlockExpire: this.millisecondsToSeconds(
        Math.max(record.blockedUntil - now, 0),
      ),
    };
  }

  private getHitKey(key: string, throttlerName: string): string {
    return `throttler:${throttlerName}:${key}:hits`;
  }

  private getBlockKey(key: string, throttlerName: string): string {
    return `throttler:${throttlerName}:${key}:blocked`;
  }

  private millisecondsToSeconds(milliseconds: number): number {
    if (milliseconds <= 0) {
      return 0;
    }

    return Math.ceil(milliseconds / 1000);
  }

  private getFallbackTimeToExpire(
    hits: number[],
    ttl: number,
    now: number,
  ): number {
    const oldestHit = hits[0];

    if (!oldestHit) {
      return 0;
    }

    return Math.max(oldestHit + ttl - now, 0);
  }
}
