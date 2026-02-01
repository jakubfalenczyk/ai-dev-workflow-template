import { Request, Response, NextFunction } from 'express';
import { Decimal } from '@prisma/client/runtime/library';
import * as orderController from './order.controller';
import * as orderService from './order.service';

jest.mock('./order.service');

const mockOrderService = orderService as jest.Mocked<typeof orderService>;

describe('orderController', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('updateOrderStatus', () => {
        const mockUpdatedOrder = {
            id: 'order-123',
            customerId: 'customer-456',
            status: 'COMPLETED',
            totalAmount: new Decimal(150.00),
            orderDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            customer: {
                id: 'customer-456',
                name: 'John Doe',
                email: 'john@example.com',
                phone: null,
                address: null,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            items: [] as any[],
        };

        it('should return 200 with updated order on success', async () => {
            mockReq.params = { id: 'order-123' };
            mockReq.body = { status: 'COMPLETED' };
            mockOrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

            await orderController.updateOrderStatus(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith('order-123', 'COMPLETED');
            expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedOrder);
        });

        it('should return 404 when order not found', async () => {
            mockReq.params = { id: 'non-existent' };
            mockReq.body = { status: 'COMPLETED' };

            const prismaError = new Error('Record to update not found');
            (prismaError as any).code = 'P2025';
            mockOrderService.updateOrderStatus.mockRejectedValue(prismaError);

            await orderController.updateOrderStatus(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Order not found' });
        });

        it('should call next with error for unexpected errors', async () => {
            mockReq.params = { id: 'order-123' };
            mockReq.body = { status: 'COMPLETED' };

            const unexpectedError = new Error('Database connection failed');
            mockOrderService.updateOrderStatus.mockRejectedValue(unexpectedError);

            await orderController.updateOrderStatus(
                mockReq as Request,
                mockRes as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
        });
    });
});
