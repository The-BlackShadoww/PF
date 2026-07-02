import type { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

type ThrottlerStorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

export class ThrottlerStorageRedisService implements ThrottlerStorage {
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
}
