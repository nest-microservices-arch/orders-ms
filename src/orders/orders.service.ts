import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import {  ClientProxy, RpcException } from '@nestjs/microservices';
import OrderPaginationDto from './dto/order-pagination.dto';
import { PRODUCTS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {



  private readonly logger = new Logger('ordersService');


  constructor(
    @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  async create(createOrderDto: CreateOrderDto) {    
    try {
      const ids = createOrderDto.items.map(item => item.productId);
      const products: any[] = await firstValueFrom(this.productsClient.send({cmd: 'validate_product'}, ids));

      const totalAmount = createOrderDto.items.reduce((acc, orderItem)=> {
        const price = products.find(product => product.id === orderItem.productId)?.price;
        return acc + price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, orderItem)=> {
        return acc + orderItem.quantity;
      }, 0);


      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany : {
              data: createOrderDto.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: products.find(product => product.id === item.productId)?.price
              }))
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,

            }
          }
        }
      })

      return {...order, OrderItem: order.OrderItem.map(item => ({
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
        name: products.find(product => product.id === item.productId)?.name
      }))};
    } catch (error) {
      throw new RpcException({ message: `Error creating order`, status: HttpStatus.BAD_REQUEST });
    }
    
    // return this.order.create({
    //   data: createOrderDto
    // });
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
    const orderDb =await this.findOne(id);

    if(orderDb.status === status) {
      return orderDb;
    }

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
