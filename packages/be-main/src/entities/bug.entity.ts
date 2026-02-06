import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { BugStatus, TimeStatus } from '@bug/shared'
import { User } from './user.entity'
import { OperationLog } from './operation-log.entity'

export { BugStatus, TimeStatus }

@Entity('bug')
export class Bug {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  title: string

  @Column({ name: 'tech_stack', type: 'varchar', length: 100 })
  techStack: string

  @Column({ type: 'longtext' })
  description: string

  @Column({ name: 'expect_effect', type: 'varchar', length: 500 })
  expectEffect: string

  @Column({ name: 'publisher_id', type: 'bigint' })
  publisherId: number

  @Column({ name: 'taker_id', type: 'bigint', nullable: true })
  takerId: number | null

  @Column({ type: 'tinyint', default: BugStatus.PENDING })
  status: BugStatus

  @CreateDateColumn({ name: 'publish_time' })
  publishTime: Date

  @Column({ name: 'take_time', type: 'datetime', nullable: true })
  takeTime: Date | null

  @UpdateDateColumn({ name: 'last_update_time' })
  lastUpdateTime: Date

  @Column({ name: 'time_status', type: 'tinyint', default: TimeStatus.NORMAL })
  timeStatus: TimeStatus

  @Column({ name: 'community_info', type: 'varchar', length: 255, nullable: true })
  communityInfo: string | null

  @Column({ name: 'operation_note', type: 'text', nullable: true })
  operationNote: string | null

  @Column({ name: 'is_delete', type: 'tinyint', default: 0 })
  isDelete: number

  @ManyToOne(() => User, (user) => user.publishedBugs)
  @JoinColumn({ name: 'publisher_id' })
  publisher: User

  @ManyToOne(() => User, (user) => user.takenBugs)
  @JoinColumn({ name: 'taker_id' })
  taker: User | null

  @OneToMany(() => OperationLog, (log) => log.bug)
  operationLogs: OperationLog[]
}
