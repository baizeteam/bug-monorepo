import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { BugService } from './bug.service'
import { CreateBugDto } from './dto/create-bug.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@ApiTags('Bug/订单')
@Controller('api/bug')
export class BugController {
  constructor(private bugService: BugService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async take(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.bugService.take(parseInt(id, 10), userId)
  }

  @Post(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: { id: number; role: number },
  ) {
    return this.bugService.updateStatus(parseInt(id, 10), dto, user)
  }
}
