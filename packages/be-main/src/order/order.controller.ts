import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { OrderService } from './order.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@ApiTags('订单')
@ApiBearerAuth()
@Controller('api/order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('my')
  async getMyOrders(
    @CurrentUser('id') userId: number,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const validType = type === 'published' || type === 'taken' ? type : 'taken'
    return this.orderService.findMyOrders(
      userId,
      validType,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    )
  }
}
