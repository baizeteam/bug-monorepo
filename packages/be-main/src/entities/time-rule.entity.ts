import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

@Entity('time_rule')
export class TimeRule {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Column({ name: 'rule_name', type: 'varchar', length: 100 })
  ruleName: string

  @Column({ name: 'status_type', type: 'tinyint' })
  statusType: number

  @Column({ name: 'warn_hour', type: 'int' })
  warnHour: number

  @Column({ name: 'expire_hour', type: 'int' })
  expireHour: number

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date

  @Column({ name: 'is_enable', type: 'tinyint', default: 1 })
  isEnable: number
}
