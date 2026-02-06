import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { Bug } from '../entities/bug.entity'
import { User } from '../entities/user.entity'
import { TimeRule } from '../entities/time-rule.entity'
import { OperationLog } from '../entities/operation-log.entity'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { TimeMonitorService } from './time-monitor.service'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Bug, User, TimeRule, OperationLog]),
  ],
  controllers: [AdminController],
  providers: [AdminService, TimeMonitorService],
})
export class AdminModule {}
