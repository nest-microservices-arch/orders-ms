import { IsPositive } from "class-validator";

import { IsNumber } from "class-validator";

export class OrderItemDto {

    @IsNumber()
    @IsPositive()
    productId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;
    
    @IsNumber()
    @IsPositive()
    price: number;
}
