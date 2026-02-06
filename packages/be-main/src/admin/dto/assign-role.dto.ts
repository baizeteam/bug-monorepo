import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { UserRole } from '@bug/shared'

export class AssignRoleDto {
  @ApiProperty({ enum: [UserRole.USER, UserRole.ADMIN], description: '0=普通用户, 1=普通管理员' })
  @IsIn([UserRole.USER, UserRole.ADMIN])
  role: UserRole
}
