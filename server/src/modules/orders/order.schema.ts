import { z } from 'zod';

export const createOrderSchema = z.object({
    body: z.object({
        customerId: z.string().uuid('Invalid Customer ID'),
        items: z.array(
            z.object({
                productId: z.string().uuid('Invalid Product ID'),
                quantity: z.number().int().min(1, 'Quantity must be at least 1'),
            })
        ).min(1, 'Order must have at least one item'),
    }),
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'], {
            message: 'Status must be PENDING, COMPLETED, or CANCELLED',
        }),
    }),
});
