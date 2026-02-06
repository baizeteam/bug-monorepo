import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '../entities'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  sign(user: User) {
    return this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    })
  }

  verify(token: string) {
    return this.jwtService.verify(token)
  }
}
