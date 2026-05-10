import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

/**
 * Helper to cache a function call with Redis
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlInSeconds: number = 3600
): Promise<T> {
  try {
    const cached = await redis.get<T>(key)
    if (cached) return cached
  } catch (error) {
    console.warn(`Redis GET failed for key: ${key}`, error)
  }

  const result = await fn()

  try {
    if (result) {
      await redis.set(key, result, { ex: ttlInSeconds })
    }
  } catch (error) {
    console.warn(`Redis SET failed for key: ${key}`, error)
  }

  return result
}
