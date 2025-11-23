import { z } from 'zod';

export const createCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().optional(),
        address: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    }),
});

export const updateCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
