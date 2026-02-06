import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsIn, IsOptional, IsString } from 'class-validator'
import { BugStatus } from '@bug/shared'

export class UpdateStatusDto {
  @ApiProperty({ enum: [BugStatus.COMMUNICATING, BugStatus.RESOLVED], description: '2=沟通中, 3=已解决' })
  @IsNumber()
  @IsIn([BugStatus.COMMUNICATING, BugStatus.RESOLVED])
  status: BugStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operationNote?: string
}
