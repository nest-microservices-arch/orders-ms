import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enum/order.enum';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsUUID()
  id: string;

  @IsEnum(OrderStatusList, {
    message: `Status must be a valid status: ${OrderStatusList.join(', ')}`,
  })
  status: OrderStatus;
}

