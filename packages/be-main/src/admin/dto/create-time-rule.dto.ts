import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsInt, Min, Max, IsIn } from 'class-validator'
import { BugStatus } from '@bug/shared'

export class CreateTimeRuleDto {
  @ApiProperty({ example: '承接后超期规则' })
  @IsString()
  ruleName: string

  @ApiProperty({ description: '关联 Bug 状态：1 已承接，2 沟通中', enum: [BugStatus.TAKEN, BugStatus.COMMUNICATING] })
  @IsInt()
  @IsIn([BugStatus.TAKEN, BugStatus.COMMUNICATING])
  statusType: number

  @ApiProperty({ example: 24, description: '预警时长（小时）' })
  @IsInt()
  @Min(1)
  @Max(8760)
  warnHour: number

  @ApiProperty({ example: 72, description: '超期时长（小时）' })
  @IsInt()
  @Min(1)
  @Max(8760)
  expireHour: number
}
