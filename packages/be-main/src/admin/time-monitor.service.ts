import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThanOrEqual } from 'typeorm'
import { Bug } from '../entities/bug.entity'
import { TimeRule } from '../entities/time-rule.entity'
import { TimeStatus, BugStatus } from '@bug/shared'

@Injectable()
export class TimeMonitorService {
  constructor(
    @InjectRepository(Bug)
    private bugRepo: Repository<Bug>,
    @InjectRepository(TimeRule)
    private ruleRepo: Repository<TimeRule>,
  ) {}

  @Cron('*/5 * * * *')
  async checkTimeStatus() {
    const rules = await this.ruleRepo.find({ where: { isEnable: 1 } })
    for (const rule of rules) {
      const now = new Date()
      const warnThreshold = new Date(now.getTime() - rule.warnHour * 60 * 60 * 1000)
      const expireThreshold = new Date(now.getTime() - rule.expireHour * 60 * 60 * 1000)

      const bugs = await this.bugRepo.find({
        where: { status: rule.statusType, isDelete: 0 },
      })

      for (const bug of bugs) {
        const refTime = rule.statusType === BugStatus.TAKEN ? bug.takeTime : bug.lastUpdateTime
        if (!refTime) continue
        const ref = new Date(refTime)
        if (ref <= expireThreshold) {
          await this.bugRepo.update(bug.id, { timeStatus: TimeStatus.EXPIRED })
        } else if (ref <= warnThreshold) {
          await this.bugRepo.update(bug.id, { timeStatus: TimeStatus.WARNING })
        } else {
          await this.bugRepo.update(bug.id, { timeStatus: TimeStatus.NORMAL })
        }
      }
    }
  }
}
