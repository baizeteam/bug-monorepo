import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Bug } from '../entities/bug.entity'
import { User } from '../entities/user.entity'
import { OperationLog } from '../entities/operation-log.entity'
import { TimeRule } from '../entities/time-rule.entity'
import { BugStatus, OperationType, TimeStatus, UserRole, UserStatus, OPERATION_TYPE_LABELS, DEFAULT_TIME_RULE_NAMES } from '@bug/shared'
import { DataSource } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Bug)
    private bugRepo: Repository<Bug>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(OperationLog)
    private logRepo: Repository<OperationLog>,
    @InjectRepository(TimeRule)
    private ruleRepo: Repository<TimeRule>,
    private dataSource: DataSource,
  ) {}

  ensureAdmin(role: number) {
    if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('需要管理员权限')
    }
  }

  ensureSuperAdmin(role: number) {
    if (role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('需要超级管理员权限')
    }
  }

  async getAdminOrders(params: {
    page?: number
    pageSize?: number
    status?: BugStatus
    timeStatus?: TimeStatus
    keyword?: string
  }) {
    const { page = 1, pageSize = 20, status, timeStatus, keyword } = params
    const qb = this.bugRepo
      .createQueryBuilder('bug')
      .where('bug.is_delete = 0')
    if (status !== undefined) qb.andWhere('bug.status = :status', { status })
    if (timeStatus !== undefined) qb.andWhere('bug.time_status = :timeStatus', { timeStatus })
    if (keyword) qb.andWhere('bug.title LIKE :kw', { kw: `%${keyword}%` })
    const total = await qb.getCount()
    const list = await qb
      .select([
        'bug.id',
        'bug.title',
        'bug.techStack',
        'bug.status',
        'bug.timeStatus',
        'bug.publishTime',
        'bug.takeTime',
        'bug.publisherId',
        'bug.takerId',
      ])
      .orderBy('bug.publish_time', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()
    if (list.length > 0) {
      const ids = [...new Set([...list.map((b) => b.publisherId), ...list.map((b) => b.takerId).filter((x): x is number => x != null)])]
      const users = await this.bugRepo.manager.find(User, {
        where: ids.map((id) => ({ id })),
        select: ['id', 'username', 'contactInfo'],
      })
      const userMap = new Map(users.map((u) => [u.id, u]))
      for (const bug of list) {
        ;(bug as any).publisher = bug.publisherId ? userMap.get(bug.publisherId) ?? null : null
        ;(bug as any).taker = bug.takerId ? userMap.get(bug.takerId) ?? null : null
      }
    }
    return {
      list: list.map((b) => ({
        id: b.id,
        title: b.title,
        techStack: b.techStack,
        status: b.status,
        timeStatus: b.timeStatus,
        publishTime: b.publishTime,
        takeTime: b.takeTime,
        publisher: (b as any).publisher,
        taker: (b as any).taker,
      })),
      total,
      page,
      pageSize,
    }
  }

  async getAdminOrderById(id: number) {
    const bug = await this.bugRepo.findOne({ where: { id, isDelete: 0 } })
    if (!bug) throw new NotFoundException('订单不存在')
    const [publisher, taker] = await Promise.all([
      bug.publisherId ? this.userRepo.findOne({ where: { id: bug.publisherId }, select: ['id', 'username', 'contactInfo'] }) : null,
      bug.takerId ? this.userRepo.findOne({ where: { id: bug.takerId }, select: ['id', 'username', 'contactInfo'] }) : null,
    ])
    return {
      id: bug.id,
      title: bug.title,
      techStack: bug.techStack,
      description: bug.description,
      expectEffect: bug.expectEffect,
      status: bug.status,
      timeStatus: bug.timeStatus,
      publishTime: bug.publishTime,
      takeTime: bug.takeTime,
      lastUpdateTime: bug.lastUpdateTime,
      communityInfo: bug.communityInfo,
      operationNote: bug.operationNote,
      publisher,
      taker,
    }
  }

  async getAdminOrderStats() {
    const qb = this.bugRepo.createQueryBuilder('bug').where('bug.is_delete = 0')
    const [total, pending, taken, communicating, resolved] = await Promise.all([
      qb.getCount(),
      this.bugRepo.count({ where: { status: BugStatus.PENDING, isDelete: 0 } }),
      this.bugRepo.count({ where: { status: BugStatus.TAKEN, isDelete: 0 } }),
      this.bugRepo.count({ where: { status: BugStatus.COMMUNICATING, isDelete: 0 } }),
      this.bugRepo.count({ where: { status: BugStatus.RESOLVED, isDelete: 0 } }),
    ])
    return {
      total,
      byStatus: {
        [BugStatus.PENDING]: pending,
        [BugStatus.TAKEN]: taken,
        [BugStatus.COMMUNICATING]: communicating,
        [BugStatus.RESOLVED]: resolved,
      },
    }
  }

  async getOverdueBugs(timeStatus?: number) {
    const where: Record<string, unknown> = { isDelete: 0 }
    if (timeStatus !== undefined) where.timeStatus = timeStatus
    const list = await this.bugRepo.find({
      where,
      order: { publishTime: 'DESC' },
    })
    if (list.length > 0) {
      const ids = [...new Set([...list.map((b) => b.publisherId), ...list.map((b) => b.takerId).filter((x): x is number => x != null)])]
      const users = await this.bugRepo.manager.find(User, {
        where: ids.map((id) => ({ id })),
        select: ['id', 'username', 'contactInfo'],
      })
      const userMap = new Map(users.map((u) => [u.id, u]))
      for (const bug of list) {
        ;(bug as any).publisher = bug.publisherId ? userMap.get(bug.publisherId) ?? null : null
        ;(bug as any).taker = bug.takerId ? userMap.get(bug.takerId) ?? null : null
      }
    }
    return list
  }

  async manualIntervention(
    bugId: number,
    operatorId: number,
    status: BugStatus,
    operationNote: string,
  ) {
    // 订单流转仅超管可操作
    const bug = await this.bugRepo.findOne({ where: { id: bugId, isDelete: 0 } })
    if (!bug) throw new NotFoundException('Bug 不存在')
    const oldStatus = bug.status
    bug.status = status
    bug.operationNote = operationNote
    await this.bugRepo.save(bug)
    await this.logRepo.save({
      operatorId,
      bugId,
      operationType: OperationType.MANUAL_INTERVENTION,
      operationContent: `${OPERATION_TYPE_LABELS[OperationType.MANUAL_INTERVENTION]}: 状态 ${oldStatus} -> ${status}, 备注: ${operationNote}`,
      operationTime: new Date(),
    })
    return bug
  }

  async getTimeRules() {
    return this.ruleRepo.find({ where: { isEnable: 1 }, order: { statusType: 'ASC' } })
  }

  async getUserList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    role?: UserRole
    status?: UserStatus
  }) {
    const { page = 1, pageSize = 20, keyword, role, status } = params
    const where: Record<string, unknown> = { isDelete: 0 }
    if (role !== undefined) where.role = role
    if (status !== undefined) where.status = status

    let list: User[]
    let total: number

    if (keyword) {
      const qb = this.userRepo
        .createQueryBuilder('user')
        .where('user.is_delete = 0')
        .andWhere(
          '(user.username LIKE :kw OR user.phone LIKE :kw OR user.email LIKE :kw)',
          { kw: `%${keyword}%` },
        )
      if (role !== undefined) qb.andWhere('user.role = :role', { role })
      if (status !== undefined) qb.andWhere('user.status = :status', { status })
      total = await qb.getCount()
      list = await qb
        .select([
          'user.id',
          'user.username',
          'user.phone',
          'user.email',
          'user.role',
          'user.status',
          'user.contactInfo',
          'user.createTime',
        ])
        .orderBy('user.createTime', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany()
    } else {
      const [listRes, totalRes] = await this.userRepo.findAndCount({
        where,
        select: ['id', 'username', 'phone', 'email', 'role', 'status', 'contactInfo', 'createTime'],
        order: { createTime: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
      list = listRes
      total = totalRes
    }
    return { list, total, page, pageSize }
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id, isDelete: 0 },
      select: ['id', 'username', 'phone', 'email', 'role', 'status', 'intro', 'contactInfo', 'createTime', 'updateTime'],
    })
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }

  async createUser(dto: CreateUserDto, operatorId: number) {
    const [byPhone, byEmail, byUsername] = await Promise.all([
      this.userRepo.findOne({ where: { phone: dto.phone, isDelete: 0 } }),
      this.userRepo.findOne({ where: { email: dto.email, isDelete: 0 } }),
      this.userRepo.findOne({ where: { username: dto.username, isDelete: 0 } }),
    ])
    if (byPhone) throw new ConflictException('手机号已存在')
    if (byEmail) throw new ConflictException('邮箱已存在')
    if (byUsername) throw new ConflictException('用户名已存在')

    const hash = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({
      username: dto.username,
      phone: dto.phone,
      email: dto.email,
      password: hash,
      intro: dto.intro,
      contactInfo: dto.contactInfo,
      role: dto.role ?? UserRole.USER,
      status: UserStatus.NORMAL,
    })
    await this.userRepo.save(user)
    await this.logRepo.save({
      operatorId,
      bugId: null,
      operationType: OperationType.USER_CREATE,
      operationContent: `创建用户: ${user.username} (id=${user.id})`,
      operationTime: new Date(),
    })
    return { id: user.id, username: user.username, phone: user.phone, email: user.email, role: user.role }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id, isDelete: 0 } })
    if (!user) throw new NotFoundException('用户不存在')

    if (dto.username !== undefined) {
      const exists = await this.userRepo.findOne({ where: { username: dto.username, isDelete: 0 } })
      if (exists && exists.id !== id) throw new ConflictException('用户名已存在')
      user.username = dto.username
    }
    if (dto.phone !== undefined) {
      const exists = await this.userRepo.findOne({ where: { phone: dto.phone, isDelete: 0 } })
      if (exists && exists.id !== id) throw new ConflictException('手机号已存在')
      user.phone = dto.phone
    }
    if (dto.email !== undefined) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email, isDelete: 0 } })
      if (exists && exists.id !== id) throw new ConflictException('邮箱已存在')
      user.email = dto.email
    }
    if (dto.password !== undefined) user.password = await bcrypt.hash(dto.password, 10)
    if (dto.contactInfo !== undefined) user.contactInfo = dto.contactInfo
    if (dto.intro !== undefined) user.intro = dto.intro

    await this.userRepo.save(user)
    return { id: user.id }
  }

  async softDeleteUser(id: number, operatorId: number) {
    const user = await this.userRepo.findOne({ where: { id, isDelete: 0 } })
    if (!user) throw new NotFoundException('用户不存在')
    user.isDelete = 1
    await this.userRepo.save(user)
    await this.logRepo.save({
      operatorId,
      bugId: null,
      operationType: OperationType.USER_DELETE,
      operationContent: `删除用户: ${user.username} (id=${id}, 软删除)`,
      operationTime: new Date(),
    })
    return { id }
  }

  async assignRole(userId: number, role: UserRole) {
    const user = await this.userRepo.findOne({ where: { id: userId, isDelete: 0 } })
    if (!user) throw new NotFoundException('用户不存在')
    if (role === UserRole.SUPER_ADMIN) throw new ForbiddenException('不能分配超级管理员角色')
    user.role = role
    await this.userRepo.save(user)
    return { id: userId, role }
  }

  async updateUserStatus(userId: number, status: UserStatus) {
    const user = await this.userRepo.findOne({ where: { id: userId, isDelete: 0 } })
    if (!user) throw new NotFoundException('用户不存在')
    user.status = status
    await this.userRepo.save(user)
    return { id: userId, status }
  }

  async getOperationLogs(bugId?: number, page = 1, pageSize = 20) {
    const where: Record<string, unknown> = {}
    if (bugId) where.bugId = bugId
    const [list, total] = await this.logRepo.findAndCount({
      where,
      order: { operationTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
    if (list.length > 0) {
      const operatorIds = [...new Set(list.map((l) => l.operatorId))]
      const bugIds = [...new Set(list.map((l) => l.bugId).filter((x): x is number => x != null))]
      const [operators, bugs] = await Promise.all([
        this.logRepo.manager.find(User, { where: operatorIds.map((id) => ({ id })), select: ['id', 'username'] }),
        bugIds.length > 0 ? this.bugRepo.find({ where: bugIds.map((id) => ({ id })), select: ['id', 'title'] }) : [],
      ])
      const opMap = new Map(operators.map((o) => [o.id, o] as [number, User]))
      const bugMap = new Map(bugs.map((b) => [b.id, b] as [number, Bug]))
      for (const log of list) {
        ;(log as any).operator = opMap.get(log.operatorId) ?? null
        ;(log as any).bug = log.bugId ? bugMap.get(log.bugId) ?? null : null
      }
    }
    return { list, total, page, pageSize }
  }

  /** 清空所有数据库数据并重新初始化种子数据（仅 SUPER_ADMIN 可调用） */
  async resetDatabase(): Promise<{ message: string }> {
    const qr = this.dataSource.createQueryRunner()
    await qr.connect()
    try {
      await qr.query('SET FOREIGN_KEY_CHECKS = 0')
      await qr.query('TRUNCATE TABLE operation_log')
      await qr.query('TRUNCATE TABLE bug')
      await qr.query('TRUNCATE TABLE user')
      await qr.query('TRUNCATE TABLE time_rule')
      await qr.query('SET FOREIGN_KEY_CHECKS = 1')

      // 重新初始化种子数据
      const hash = await bcrypt.hash('admin123', 10)
      await this.userRepo.save([
        {
          username: 'super_admin',
          phone: '13800000001',
          email: 'super_admin@bug.local',
          password: hash,
          role: UserRole.SUPER_ADMIN,
          status: 0,
        },
        {
          username: 'admin',
          phone: '13800000000',
          email: 'admin@bug.local',
          password: hash,
          role: UserRole.ADMIN,
          status: 0,
        },
      ])
      await this.ruleRepo.save([
        { ruleName: DEFAULT_TIME_RULE_NAMES[1], statusType: 1, warnHour: 24, expireHour: 72, isEnable: 1 },
        { ruleName: DEFAULT_TIME_RULE_NAMES[2], statusType: 2, warnHour: 48, expireHour: 120, isEnable: 1 },
      ])

      return { message: '数据库已清空并重新初始化，默认管理员: super_admin/admin / admin123' }
    } finally {
      await qr.release()
    }
  }
}
