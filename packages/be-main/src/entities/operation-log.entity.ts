import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { OperationType } from '@bug/shared'
import { User } from './user.entity'
import { Bug } from './bug.entity'

export { OperationType }

@Entity('operation_log')
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number

  @Column({ name: 'operator_id', type: 'bigint' })
  operatorId: number

  @Column({ name: 'bug_id', type: 'bigint', nullable: true })
  bugId: number | null

  @Column({ name: 'operation_type', type: 'tinyint' })
  operationType: OperationType

  @Column({ name: 'operation_content', type: 'text' })
  operationContent: string

  @Column({ name: 'operation_time', type: 'datetime' })
  operationTime: Date

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User

  @ManyToOne(() => Bug, (bug) => bug.operationLogs)
  @JoinColumn({ name: 'bug_id' })
  bug: Bug | null
}
