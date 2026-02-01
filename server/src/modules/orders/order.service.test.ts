import { prismaMock } from '../../test/prisma-mock';
import * as orderService from './order.service';

// Mock prisma
jest.mock('../../prisma', () => ({
    __esModule: true,
    default: prismaMock,
}));

describe('orderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateOrderStatus', () => {
        const mockOrder = {
            id: 'order-123',
            customerId: 'customer-456',
            status: 'COMPLETED',
            totalAmount: 150.00,
            orderDate: new Date('2024-01-15'),
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-16'),
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
            items: [
                {
                    id: 'item-1',
                    orderId: 'order-123',
                    productId: 'product-789',
                    quantity: 2,
                    unitPrice: 75.00,
                    product: {
                        id: 'product-789',
                        sku: 'PROD-001',
                        name: 'Test Product',
                        description: null,
                        price: 75.00,
                        stock: 100,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            ],
        };

        it('should update order status from PENDING to COMPLETED', async () => {
            prismaMock.order.update.mockResolvedValue(mockOrder);

            const result = await orderService.updateOrderStatus('order-123', 'COMPLETED');

            expect(prismaMock.order.update).toHaveBeenCalledWith({
                where: { id: 'order-123' },
                data: { status: 'COMPLETED' },
                include: {
                    customer: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            expect(result.status).toBe('COMPLETED');
        });

        it('should update order status from PENDING to CANCELLED', async () => {
            const cancelledOrder = { ...mockOrder, status: 'CANCELLED' };
            prismaMock.order.update.mockResolvedValue(cancelledOrder);

            const result = await orderService.updateOrderStatus('order-123', 'CANCELLED');

            expect(prismaMock.order.update).toHaveBeenCalledWith({
                where: { id: 'order-123' },
                data: { status: 'CANCELLED' },
                include: {
                    customer: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            expect(result.status).toBe('CANCELLED');
        });

        it('should throw error when order not found', async () => {
            const prismaError = new Error('Record to update not found');
            (prismaError as any).code = 'P2025';
            prismaMock.order.update.mockRejectedValue(prismaError);

            await expect(orderService.updateOrderStatus('non-existent', 'COMPLETED'))
                .rejects.toThrow();
        });
    });
});
