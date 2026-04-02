import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: '用户名或手机号或邮箱' })
  @IsString()
  @IsNotEmpty({ message: '用户名/手机号/邮箱不能为空' })
  account: string

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string
}
