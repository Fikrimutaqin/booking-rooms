import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else {
                const body = res as { message?: string | string[]; error?: string };
                message = body.message ?? exception.message;
                error = body.error ?? exception.name;
            }
        } else {
            // Error tak terduga: catat detailnya, jangan bocor ke client
            this.logger.error(
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        const body: ApiErrorResponse = {
            statusCode,
            message,
            error,
            path: request.url,
            timestamp: new Date().toISOString(),
        };

        response.status(statusCode).json(body);
    }
}