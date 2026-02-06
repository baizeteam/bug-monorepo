import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { BugStatus, TimeStatus, UserRole, UserStatus } from '@bug/shared'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { AssignRoleDto } from './dto/assign-role.dto'
import { UpdateUserStatusDto } from './dto/update-status.dto'

@ApiTags('后台管理')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('orders/stats')
  async getAdminOrderStats(@CurrentUser() user: { role: number }) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getAdminOrderStats()
  }

  @Get('orders/:id')
  async getAdminOrderById(@CurrentUser() user: { role: number }, @Param('id') id: string) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getAdminOrderById(parseInt(id, 10))
  }

  @Get('orders')
  async getAdminOrders(
    @CurrentUser() user: { role: number },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('timeStatus') timeStatus?: string,
    @Query('keyword') keyword?: string,
  ) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getAdminOrders({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      status: status !== undefined ? parseInt(status, 10) as BugStatus : undefined,
      timeStatus: timeStatus !== undefined ? parseInt(timeStatus, 10) as TimeStatus : undefined,
      keyword: keyword || undefined,
    })
  }

  @Get('overdue-bugs')
  async getOverdueBugs(
    @CurrentUser() user: { id: number; role: number },
    @Query('timeStatus') timeStatus?: string,
  ) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getOverdueBugs(
      timeStatus !== undefined ? parseInt(timeStatus, 10) : undefined,
    )
  }

  @Post('db/reset')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async resetDatabase(@CurrentUser() user: { role: number }) {
    this.adminService.ensureSuperAdmin(user.role)
    return this.adminService.resetDatabase()
  }

  @Post('manual-intervention')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async manualIntervention(
    @CurrentUser() user: { id: number; role: number },
    @Body() body: { bugId: number; status: BugStatus; operationNote: string },
  ) {
    return this.adminService.manualIntervention(
      body.bugId,
      user.id,
      body.status,
      body.operationNote || '',
    )
  }

  @Get('time-rules')
  async getTimeRules(@CurrentUser() user: { role: number }) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getTimeRules()
  }

  @Get('operation-logs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getOperationLogs(
    @CurrentUser() user: { role: number },
    @Query('bugId') bugId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getOperationLogs(
      bugId ? parseInt(bugId, 10) : undefined,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    )
  }

  @Get('users')
  async getUserList(
    @CurrentUser() user: { role: number },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getUserList({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      keyword,
      role: role !== undefined ? parseInt(role, 10) : undefined,
      status: status !== undefined ? parseInt(status, 10) : undefined,
    })
  }

  @Get('users/:id')
  async getUserById(@CurrentUser() user: { role: number }, @Param('id') id: string) {
    this.adminService.ensureAdmin(user.role)
    return this.adminService.getUserById(parseInt(id, 10))
  }

  @Post('users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createUser(@Body() dto: CreateUserDto, @CurrentUser() user: { id: number }) {
    return this.adminService.createUser(dto, user.id)
  }

  @Put('users/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(parseInt(id, 10), dto)
  }

  @Delete('users/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async softDeleteUser(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.adminService.softDeleteUser(parseInt(id, 10), user.id)
  }

  @Put('users/:id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.adminService.assignRole(parseInt(id, 10), dto.role)
  }

  @Put('users/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(parseInt(id, 10), dto.status)
  }
}
