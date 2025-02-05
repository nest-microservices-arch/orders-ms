import { OrderStatus } from "@prisma/client";
import { OrderStatusList } from "../enum/order.enum";
import { IsEnum } from "class-validator";


export class StatusDto {
  @IsEnum(OrderStatusList, {
    message: `Status must be a valid status: ${OrderStatusList.join(', ')}`,
  })
  public status: OrderStatus;
}
