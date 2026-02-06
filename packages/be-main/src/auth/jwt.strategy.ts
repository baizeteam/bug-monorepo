import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwtSecret') || 'bug-platform-secret-key',
    })
  }

  async validate(payload: { sub: number; username: string; role: number }) {
    const user = await this.userService.findById(payload.sub)
    if (!user) return null
    return { id: user.id, username: user.username, role: user.role }
  }
}
