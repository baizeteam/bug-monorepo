import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { UserStatus } from '@bug/shared'

export class UpdateUserStatusDto {
  @ApiProperty({ enum: [UserStatus.NORMAL, UserStatus.DISABLED], description: '0=正常, 1=已禁用' })
  @IsIn([UserStatus.NORMAL, UserStatus.DISABLED])
  status: UserStatus
}
