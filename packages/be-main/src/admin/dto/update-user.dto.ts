import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[\w.-]+@[\w.-]+\.\w+$/, { message: '邮箱格式不正确' })
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password?: string

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
