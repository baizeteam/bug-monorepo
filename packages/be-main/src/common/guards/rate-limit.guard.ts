import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RATE_LIMIT_KEY, type RateLimitOptions } from './rate-limit.decorator'

type Counter = { count: number; resetAt: number }

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, Counter>()

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!options) return true

    const req = context.switchToHttp().getRequest<{
      user?: { id?: number }
      ip?: string
      route?: { path?: string }
      method?: string
      headers?: Record<string, string | string[] | undefined>
      body?: Record<string, unknown>
    }>()
    const now = Date.now()
    const method = req.method || 'GET'
    const routePath = req.route?.path || 'unknown'
    const endpoint = `${method}:${routePath}`
    const ip = this.getClientIp(req)
    const deviceId = this.getHeader(req, 'x-device-id') || 'unknown-device'
    const account = String(req.body?.account ?? '').trim() || 'unknown-account'

    for (const rule of options.rules) {
      let subject = 'unknown'
      if (rule.dimension === 'user') subject = req.user?.id ? `u:${req.user.id}` : 'u:anonymous'
      if (rule.dimension === 'ip') subject = `ip:${ip}`
      if (rule.dimension === 'device') subject = `d:${deviceId}`
      if (rule.dimension === 'account') subject = `a:${account}`
      if (rule.dimension === 'global') subject = 'global'

      const key = `${rule.dimension}:${subject}:${endpoint}`
      const current = this.store.get(key)

      if (!current || current.resetAt <= now) {
        this.store.set(key, { count: 1, resetAt: now + rule.windowMs })
        continue
      }
      if (current.count >= rule.limit) {
        const retryAfterSec = Math.ceil((current.resetAt - now) / 1000)
        throw new HttpException(`操作过于频繁，请 ${retryAfterSec}s 后再试`, HttpStatus.TOO_MANY_REQUESTS)
      }
      current.count += 1
    }

    this.cleanup(now)
    return true
  }

  private getHeader(
    req: { headers?: Record<string, string | string[] | undefined> },
    name: string,
  ): string | undefined {
    const value = req.headers?.[name]
    if (!value) return undefined
    return Array.isArray(value) ? value[0] : value
  }

  private getClientIp(req: {
    ip?: string
    headers?: Record<string, string | string[] | undefined>
  }): string {
    const xff = this.getHeader(req, 'x-forwarded-for')
    if (xff) return xff.split(',')[0].trim()
    const xrip = this.getHeader(req, 'x-real-ip')
    if (xrip) return xrip
    return req.ip || 'unknown-ip'
  }

  private cleanup(now: number) {
    for (const [k, v] of this.store) {
      if (v.resetAt <= now) this.store.delete(k)
    }
  }
}
