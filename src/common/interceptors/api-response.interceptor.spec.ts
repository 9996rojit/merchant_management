import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
    const reflector = { get: jest.fn() };
    let interceptor: ApiResponseInterceptor;

    beforeEach(() => {
        jest.clearAllMocks();
        interceptor = new ApiResponseInterceptor(reflector as unknown as Reflector);
    });

    function createContext(method: string): ExecutionContext {
        return {
            getHandler: jest.fn(),
            switchToHttp: () => ({ getRequest: () => ({ method }) }),
        } as unknown as ExecutionContext;
    }

    it('wraps data with the route-specific message', async () => {
        reflector.get.mockReturnValue('User retrieved successfully.');
        const next = { handle: () => of({ id: 'user-id' }) } as CallHandler;

        await expect(lastValueFrom(interceptor.intercept(createContext('GET'), next))).resolves.toEqual({
            message: 'User retrieved successfully.',
            data: { id: 'user-id' },
        });
    });

    it('preserves an existing service message and removes it from data', async () => {
        reflector.get.mockReturnValue(undefined);
        const next = {
            handle: () => of({ message: 'Record loaded.', record: { id: 'record-id' } }),
        } as CallHandler;

        await expect(lastValueFrom(interceptor.intercept(createContext('GET'), next))).resolves.toEqual({
            message: 'Record loaded.',
            data: { record: { id: 'record-id' } },
        });
    });

    it('returns a null data value for an empty response', async () => {
        reflector.get.mockReturnValue('User deleted successfully.');
        const next = { handle: () => of(null) } as CallHandler;

        await expect(lastValueFrom(interceptor.intercept(createContext('DELETE'), next))).resolves.toEqual({
            message: 'User deleted successfully.',
            data: null,
        });
    });
});