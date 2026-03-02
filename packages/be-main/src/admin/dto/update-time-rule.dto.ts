import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsInt, Min, Max, IsIn, IsOptional } from 'class-validator'
import { BugStatus } from '@bug/shared'

export class UpdateTimeRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruleName?: string

  @ApiPropertyOptional({ enum: [BugStatus.TAKEN, BugStatus.COMMUNICATING] })
  @IsOptional()
  @IsInt()
  @IsIn([BugStatus.TAKEN, BugStatus.COMMUNICATING])
  statusType?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8760)
  warnHour?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8760)
  expireHour?: number
}
