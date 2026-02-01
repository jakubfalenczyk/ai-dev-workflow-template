import { PrismaClient } from '@prisma/client';

// Create mock functions for each model
const createMockModel = () => ({
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
});

export const prismaMock = {
    customer: createMockModel(),
    product: createMockModel(),
    order: createMockModel(),
    orderItem: createMockModel(),
    $transaction: jest.fn((callback) => callback(prismaMock)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
} as unknown as jest.Mocked<PrismaClient> & {
    customer: ReturnType<typeof createMockModel>;
    product: ReturnType<typeof createMockModel>;
    order: ReturnType<typeof createMockModel>;
    orderItem: ReturnType<typeof createMockModel>;
};
