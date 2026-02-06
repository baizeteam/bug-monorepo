import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { LoginDto } from '../user/dto/login.dto'
import { UnauthorizedException } from '@nestjs/common'

@ApiTags('认证')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
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
