import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { UserRole, UserStatus } from '@bug/shared'
import { Bug } from './bug.entity'
import { OperationLog } from './operation-log.entity'

export { UserRole, UserStatus }

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string

  @Column({ type: 'varchar', length: 255 })
  password: string

  @Column({ type: 'text', nullable: true })
  intro: string

  @Column({ type: 'tinyint', default: UserRole.USER })
  role: UserRole

  @Column({ name: 'contact_info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string

  @Column({ type: 'tinyint', default: UserStatus.NORMAL })
  status: UserStatus

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date

  @Column({ name: 'is_delete', type: 'tinyint', default: 0 })
  isDelete: number

  @OneToMany(() => Bug, (bug) => bug.publisher)
  publishedBugs: Bug[]

  @OneToMany(() => Bug, (bug) => bug.taker)
  takenBugs: Bug[]

  @OneToMany(() => OperationLog, (log) => log.operator)
  operationLogs: OperationLog[]
}
