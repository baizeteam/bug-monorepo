import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Bug } from '../entities'
import { User } from '../entities'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Bug)
    private bugRepo: Repository<Bug>,
  ) {}

  async findMyOrders(
    userId: number,
    type: 'published' | 'taken' = 'taken',
    page = 1,
    pageSize = 20,
  ) {
    const isPublished = type === 'published'
    const where: Record<string, unknown> = { isDelete: 0 }
    if (isPublished) {
      where.publisherId = userId
    } else {
      where.takerId = userId
    }

    const [list, total] = await this.bugRepo.findAndCount({
      where,
      order: isPublished ? { publishTime: 'DESC' } : { takeTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    if (list.length > 0) {
      const publisherIds = [...new Set(list.map((b) => b.publisherId))]
      const takerIds = [...new Set(list.map((b) => b.takerId).filter((x): x is number => x != null))]
      const [publishers, takers] = await Promise.all([
        this.bugRepo.manager.find(User, {
          where: publisherIds.map((id) => ({ id })),
          select: ['id', 'username', 'contactInfo'],
        }),
        this.bugRepo.manager.find(User, {
          where: takerIds.map((id) => ({ id })),
          select: ['id', 'username', 'contactInfo'],
        }),
      ])
      const pubMap = new Map(publishers.map((p) => [p.id, p]))
      const takerMap = new Map(takers.map((t) => [t.id, t]))
      for (const bug of list) {
        ;(bug as any).publisher = bug.publisherId ? pubMap.get(bug.publisherId) ?? null : null
        ;(bug as any).taker = bug.takerId ? takerMap.get(bug.takerId) ?? null : null
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
}
