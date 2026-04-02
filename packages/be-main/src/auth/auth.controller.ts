import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { LoginDto } from '../user/dto/login.dto'
import { RateLimitGuard } from '../common/guards/rate-limit.guard'
import { RateLimit } from '../common/guards/rate-limit.decorator'

@ApiTags('认证')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    rules: [
      { dimension: 'ip', limit: 60, windowMs: 60 * 1000 },
      { dimension: 'device', limit: 20, windowMs: 60 * 1000 },
      { dimension: 'account', limit: 10, windowMs: 60 * 1000 },
      { dimension: 'global', limit: 300, windowMs: 60 * 1000 },
    ],
  })
  async login(@Body() dto: LoginDto) {
    const user = await this.userService.findByAccount(dto.account)
    if (!user) throw new UnauthorizedException('账号或密码错误')
    if (user.status !== 0) throw new UnauthorizedException('账号已被禁用')
    const ok = await this.userService.validatePassword(dto.password, user.password)
    if (!ok) throw new UnauthorizedException('账号或密码错误')
    const token = this.authService.sign(user)
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    }
  }
}
