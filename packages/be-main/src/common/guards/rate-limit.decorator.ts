import { SetMetadata } from '@nestjs/common'

export const RATE_LIMIT_KEY = 'rate_limit'

export type RateLimitDimension = 'ip' | 'device' | 'account' | 'user' | 'global'

export interface RateLimitRule {
  dimension: RateLimitDimension
  limit: number
  windowMs: number
}

export interface RateLimitOptions {
  rules: RateLimitRule[]
}

export function RateLimit(limit: number, windowMs: number): MethodDecorator
export function RateLimit(options: RateLimitOptions): MethodDecorator
export function RateLimit(limitOrOptions: number | RateLimitOptions, windowMs?: number): MethodDecorator {
  if (typeof limitOrOptions === 'number') {
    const rule: RateLimitRule = {
      dimension: 'user',
      limit: limitOrOptions,
      windowMs: windowMs ?? 60_000,
    }
    return SetMetadata(RATE_LIMIT_KEY, { rules: [rule] } satisfies RateLimitOptions)
  }
  return SetMetadata(RATE_LIMIT_KEY, limitOrOptions)
}
