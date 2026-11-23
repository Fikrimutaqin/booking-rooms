import { PaginationMeta } from './paginated-result.interface';

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    path: string;
    timestamp: string;
}