import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: '手机号或邮箱' })
  @IsString()
  @IsNotEmpty({ message: '手机号或邮箱不能为空' })
  account: string

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string
}
