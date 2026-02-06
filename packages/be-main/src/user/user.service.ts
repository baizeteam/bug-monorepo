import { Injectable, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '../entities'
import { UserRole, UserStatus } from '@bug/shared'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const [byPhone, byEmail, byUsername] = await Promise.all([
      this.userRepo.findOne({ where: { phone: dto.phone, isDelete: 0 } }),
      this.userRepo.findOne({ where: { email: dto.email, isDelete: 0 } }),
      this.userRepo.findOne({ where: { username: dto.username, isDelete: 0 } }),
    ])
    if (byPhone) throw new ConflictException('手机号已注册')
    if (byEmail) throw new ConflictException('邮箱已注册')
    if (byUsername) throw new ConflictException('用户名已存在')

    const hash = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({
      username: dto.username,
      phone: dto.phone,
      email: dto.email,
      password: hash,
      intro: dto.intro,
      contactInfo: dto.contactInfo,
      role: UserRole.USER,
      status: UserStatus.NORMAL,
    })
    await this.userRepo.save(user)
    return { id: user.id, username: user.username, phone: user.phone, email: user.email }
  }

  async findByAccount(account: string) {
    return this.userRepo.findOne({
      where: [
        { phone: account, isDelete: 0 },
        { email: account, isDelete: 0 },
      ],
    })
  }

  async validatePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash)
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id, isDelete: 0 },
      select: ['id', 'username', 'phone', 'email', 'intro', 'contactInfo', 'role', 'status', 'createTime'],
    })
    return user
  }
}
