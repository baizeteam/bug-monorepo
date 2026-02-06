import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MaxLength, MinLength, IsOptional } from 'class-validator'

export class CreateBugDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  @MinLength(1)
  @MaxLength(50)
  title: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '技术栈不能为空' })
  @MaxLength(100)
  techStack: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '问题描述不能为空' })
  description: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '预期效果不能为空' })
  @MaxLength(500)
  expectEffect: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  communityInfo?: string
}
