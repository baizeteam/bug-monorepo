import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional } from 'class-validator'

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(2, { message: '用户名至少2个字符' })
  @MaxLength(50)
  username: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '邮箱不能为空' })
  @Matches(/^[\w.-]+@[\w.-]+\.\w+$/, { message: '邮箱格式不正确' })
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  password: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactInfo?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  intro?: string
}
