import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Bug } from '../entities'
import { User } from '../entities'
import { OperationLog } from '../entities'
import { BugStatus, TimeStatus, OperationType, UserRole } from '@bug/shared'
import { CreateBugDto } from './dto/create-bug.dto'
import { UpdateStatusDto } from './dto/update-status.dto'

@Injectable()
export class BugService {
  constructor(
    @InjectRepository(Bug)
    private bugRepo: Repository<Bug>,
    @InjectRepository(OperationLog)
    private logRepo: Repository<OperationLog>,
  ) {}

  async create(dto: CreateBugDto, publisherId: number) {
    const bug = this.bugRepo.create({
      ...dto,
      publisherId,
      status: BugStatus.PENDING,
      timeStatus: TimeStatus.NORMAL,
    })
    await this.bugRepo.save(bug)
    await this.logRepo.save({
      operatorId: publisherId,
      bugId: bug.id,
      operationType: OperationType.BUG_PUBLISH,
      operationContent: `发布 Bug: ${bug.title}`,
      operationTime: new Date(),
    })
    return bug
  }

  async take(bugId: number, takerId: number) {
    const bug = await this.bugRepo.findOne({ where: { id: bugId, isDelete: 0 } })
    if (!bug) throw new NotFoundException('Bug 不存在')
    if (bug.status !== BugStatus.PENDING) throw new BadRequestException('该 Bug 已被承接')
    bug.takerId = takerId
    bug.status = BugStatus.TAKEN
    bug.takeTime = new Date()
    await this.bugRepo.save(bug)
    await this.logRepo.save({
      operatorId: takerId,
      bugId: bug.id,
      operationType: OperationType.BUG_TAKE,
      operationContent: `承接 Bug: ${bug.title}`,
      operationTime: new Date(),
    })
    return bug
  }

  async updateStatus(
    bugId: number,
    dto: UpdateStatusDto,
    operator: { id: number; role: number },
  ) {
    const bug = await this.bugRepo.findOne({ where: { id: bugId, isDelete: 0 } })
    if (!bug) throw new NotFoundException('Bug 不存在')

    const isSuperAdmin = operator.role === UserRole.SUPER_ADMIN
    const isAdmin = operator.role === UserRole.ADMIN || isSuperAdmin
    const isTakerOrPublisher =
      operator.id === bug.takerId || operator.id === bug.publisherId
    // 超管可改任意；承接人/发布人可改自己相关订单；管理员可将任意订单改为「沟通中」（运营拉群）
    const canModify =
      isSuperAdmin ||
      isTakerOrPublisher ||
      (isAdmin && dto.status === BugStatus.COMMUNICATING)
    if (!canModify) {
      throw new ForbiddenException('无权限操作订单状态')
    }

    // 普通用户不可改为「沟通中」，仅后台管理员可操作（拉进微信群后由运营改状态）
    if (dto.status === BugStatus.COMMUNICATING && !isAdmin) {
      throw new ForbiddenException('仅后台管理员可将订单改为沟通中')
    }

    const oldStatus = bug.status
    bug.status = dto.status
    if (dto.operationNote) bug.operationNote = dto.operationNote
    await this.bugRepo.save(bug)
    const statusDesc = dto.status === BugStatus.RESOLVED ? '订单已完成' : `状态更新: ${oldStatus} -> ${dto.status}`
    await this.logRepo.save({
      operatorId: operator.id,
      bugId: bug.id,
      operationType: OperationType.STATUS_UPDATE,
      operationContent: `${statusDesc}${dto.operationNote ? `, 备注: ${dto.operationNote}` : ''}`,
      operationTime: new Date(),
    })
    return bug
  }

  async findList(params: {
    techStack?: string
    status?: number
    timeStatus?: number
    keyword?: string
    page?: number
    pageSize?: number
  }) {
    const { techStack, status, timeStatus, keyword, page = 1, pageSize = 10 } = params

    const where: Record<string, unknown> = { isDelete: 0 }
    if (techStack) where.techStack = Like(`%${techStack}%`)
    if (status !== undefined) where.status = status
    if (timeStatus !== undefined) where.timeStatus = timeStatus

    let list: Bug[]
    let total: number

    if (keyword) {
      const qb = this.bugRepo
        .createQueryBuilder('bug')
        .where('bug.is_delete = 0')
        .andWhere('(bug.title LIKE :kw OR bug.description LIKE :kw)', {
          kw: `%${keyword}%`,
        })
      if (techStack) qb.andWhere('bug.tech_stack LIKE :tech', { tech: `%${techStack}%` })
      if (status !== undefined) qb.andWhere('bug.status = :status', { status })
      if (timeStatus !== undefined) qb.andWhere('bug.time_status = :timeStatus', { timeStatus })
      total = await qb.getCount()
      list = await qb
        .orderBy('bug.publish_time', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany()
    } else {
      const [listRes, totalRes] = await this.bugRepo.findAndCount({
        where,
        order: { publishTime: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
      list = listRes
      total = totalRes
    }

    if (list.length > 0) {
      const publisherIds = [...new Set(list.map((b) => b.publisherId))]
      const publishers = await this.bugRepo.manager.find(User, {
        where: publisherIds.map((id) => ({ id })),
        select: ['id', 'username', 'contactInfo'],
      })
      const pubMap = new Map(publishers.map((p) => [p.id, p]))
      for (const bug of list) {
        ;(bug as any).publisher = pubMap.get(bug.publisherId) ?? null
      }
    }

    return { list, total, page, pageSize }
  }

  async findById(id: number) {
    const bug = await this.bugRepo.findOne({
      where: { id, isDelete: 0 },
    })
    if (!bug) throw new NotFoundException('Bug 不存在')
    const publisher = bug.publisherId
      ? await this.bugRepo.manager.findOne(User, {
          where: { id: bug.publisherId },
          select: ['id', 'username', 'contactInfo'],
        })
      : null
    const taker = bug.takerId
      ? await this.bugRepo.manager.findOne(User, {
          where: { id: bug.takerId },
          select: ['id', 'username'],
        })
      : null
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
      publisherId: bug.publisherId,
      takerId: bug.takerId,
      communityInfo: bug.communityInfo,
      operationNote: bug.operationNote,
      publisher,
      taker,
    }
  }
}
