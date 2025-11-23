import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        sku: z.string().min(1, 'SKU is required'),
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        price: z.number().min(0, 'Price must be positive'),
        stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        sku: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        stock: z.number().int().min(0).optional(),
    }),
});
