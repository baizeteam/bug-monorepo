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

  async findMyOrders(userId: number, page = 1, pageSize = 20) {
    const [list, total] = await this.bugRepo.findAndCount({
      where: { takerId: userId, isDelete: 0 },
      order: { takeTime: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    if (list.length > 0) {
      const publisherIds = [...new Set(list.map((b) => b.publisherId))]
      const publishers = await this.bugRepo.manager.find(User, {
        where: publisherIds.map((id) => ({ id })),
        select: ['id', 'username', 'contactInfo'],
      })
      const pubMap = new Map(publishers.map((p) => [p.id, p]))
      for (const bug of list) {
        ;(bug as any).publisher = bug.publisherId ? pubMap.get(bug.publisherId) ?? null : null
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
      })),
      total,
      page,
      pageSize,
    }
  }
}
