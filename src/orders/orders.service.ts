import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import OrderPaginationDto from './dto/order-pagination.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {


  private readonly logger = new Logger('ordersService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  create(createOrderDto: CreateOrderDto) {    
    return this.order.create({
      data: createOrderDto
    });
  }

  async findAll( orderPaginationDto: OrderPaginationDto) {

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });


    const currentPage = orderPaginationDto.page || 1;
    const perPage = orderPaginationDto.limit || 10;

    return {
      data : await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status
        }
      }),
      meta: {
        total: totalPages,
        currentPage: currentPage,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: {
        id: id
      }
    });
    
    if (!order) {
      throw new RpcException({ message: `Order with id ${id} not found`, status: HttpStatus.NOT_FOUND });
    }
    
    return order;
  }

  async changeOrderStatus(id: string, status: OrderStatus) {
    await this.findOne(id);
    return await this.order.update({
      where: {
        id: id
      },
      data: {
        status: status
      }
    });
  }
}
