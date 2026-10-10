import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const customMessage = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler());
        const method = context.switchToHttp().getRequest<{ method: string }>().method;

        return next.handle().pipe(
            map((response: unknown) => {
                const body = this.isRecord(response) ? response : undefined;
                const message = customMessage ?? this.getExistingMessage(body) ?? this.getDefaultMessage(method);
                const data = body && 'message' in body ? this.withoutMessage(body) : response;

                return { message, data };
            }),
        );
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    private getExistingMessage(body?: Record<string, unknown>): string | undefined {
        return typeof body?.message === 'string' ? body.message : undefined;
    }

    private getDefaultMessage(method: string): string {
        switch (method.toUpperCase()) {
            case 'POST':
                return 'Resource created successfully.';
            case 'PATCH':
            case 'PUT':
                return 'Resource updated successfully.';
            case 'DELETE':
                return 'Resource deleted successfully.';
            default:
                return 'Request completed successfully.';
        }
    }

    private withoutMessage(body: Record<string, unknown>): Record<string, unknown> {
        const { message: _message, ...data } = body;
        return data;
    }
}