import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Order } from '../types/order.type';

export class QueryRoomDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    minCapacity?: number;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    order?: Order;
}