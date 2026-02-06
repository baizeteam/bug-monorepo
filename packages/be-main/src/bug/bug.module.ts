import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Bug } from '../entities'
import { OperationLog } from '../entities'
import { BugController } from './bug.controller'
import { BugService } from './bug.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Bug, OperationLog]),
  ],
  controllers: [BugController],
  providers: [BugService],
  exports: [BugService],
})
export class BugModule {}
