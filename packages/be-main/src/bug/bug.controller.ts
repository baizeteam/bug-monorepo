import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { BugService } from './bug.service'
import { CreateBugDto } from './dto/create-bug.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '@bug/shared'
import { RateLimitGuard } from '../common/guards/rate-limit.guard'
import { RateLimit } from '../common/guards/rate-limit.decorator'

@ApiTags('Bug/订单')
@Controller('api/bug')
export class BugController {
  constructor(private bugService: BugService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.USER)
  @RateLimit({
    rules: [
      { dimension: 'user', limit: 6, windowMs: 60 * 1000 },
      { dimension: 'device', limit: 10, windowMs: 60 * 1000 },
      { dimension: 'global', limit: 120, windowMs: 60 * 1000 },
    ],
  })
  async create(@Body() dto: CreateBugDto, @CurrentUser('id') userId: number) {
    return this.bugService.create(dto, userId)
  }

  @Get()
  async list(
    @Query('techStack') techStack?: string,
    @Query('status') status?: string,
    @Query('timeStatus') timeStatus?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.bugService.findList({
      techStack,
      status: status ? parseInt(status, 10) : undefined,
      timeStatus: timeStatus ? parseInt(timeStatus, 10) : undefined,
      keyword,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    })
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.bugService.findById(parseInt(id, 10))
  }

  @Post(':id/take')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.USER)
  @RateLimit({
    rules: [
      { dimension: 'user', limit: 20, windowMs: 60 * 1000 },
      { dimension: 'device', limit: 30, windowMs: 60 * 1000 },
      { dimension: 'global', limit: 300, windowMs: 60 * 1000 },
    ],
  })
  async take(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.bugService.take(parseInt(id, 10), userId)
  }

  @Post(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.USER)
  @RateLimit({
    rules: [
      { dimension: 'user', limit: 30, windowMs: 60 * 1000 },
      { dimension: 'device', limit: 40, windowMs: 60 * 1000 },
      { dimension: 'global', limit: 400, windowMs: 60 * 1000 },
    ],
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: { id: number; role: number },
  ) {
    return this.bugService.updateStatus(parseInt(id, 10), dto, user)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.USER)
  @RateLimit({
    rules: [
      { dimension: 'user', limit: 10, windowMs: 60 * 1000 },
      { dimension: 'device', limit: 15, windowMs: 60 * 1000 },
      { dimension: 'global', limit: 120, windowMs: 60 * 1000 },
    ],
  })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.bugService.remove(parseInt(id, 10), userId)
  }
}
