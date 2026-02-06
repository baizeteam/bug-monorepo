import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '../entities'
import { TimeRule } from '../entities'
import { UserRole, DEFAULT_TIME_RULE_NAMES } from '@bug/shared'

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TimeRule)
    private ruleRepo: Repository<TimeRule>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin()
    await this.seedTimeRules()
  }

  private async seedAdmin() {
    const superAdminExists = await this.userRepo.findOne({
      where: { role: UserRole.SUPER_ADMIN, isDelete: 0 },
    })
    if (!superAdminExists) {
      const hash = await bcrypt.hash('admin123', 10)
      await this.userRepo.save({
        username: 'super_admin',
        phone: '13800000001',
        email: 'super_admin@bug.local',
        password: hash,
        role: UserRole.SUPER_ADMIN,
        status: 0,
      })
      console.log('[Seed] 已创建超级管理员: super_admin / admin123')
    }

    const adminExists = await this.userRepo.findOne({
      where: { username: 'admin', isDelete: 0 },
    })
    if (!adminExists) {
      const hash = await bcrypt.hash('admin123', 10)
      await this.userRepo.save({
        username: 'admin',
        phone: '13800000000',
        email: 'admin@bug.local',
        password: hash,
        role: UserRole.ADMIN,
        status: 0,
      })
      console.log('[Seed] 已创建普通管理员: admin / admin123')
    }
  }

  private async seedTimeRules() {
    const count = await this.ruleRepo.count()
    if (count > 0) return
    await this.ruleRepo.save([
      { ruleName: DEFAULT_TIME_RULE_NAMES[1], statusType: 1, warnHour: 24, expireHour: 72, isEnable: 1 },
      { ruleName: DEFAULT_TIME_RULE_NAMES[2], statusType: 2, warnHour: 48, expireHour: 120, isEnable: 1 },
    ])
    console.log('[Seed] 已创建默认时效规则')
  }
}
