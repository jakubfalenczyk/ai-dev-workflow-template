import prisma from '../../prisma';
import { Prisma } from '@prisma/client';

export const createProduct = async (data: Prisma.ProductCreateInput) => {
    return prisma.product.create({
        data,
    });
};

export const getProducts = async () => {
    return prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const getProductById = async (id: string) => {
    return prisma.product.findUnique({
        where: { id },
    });
};

export const updateProduct = async (id: string, data: Prisma.ProductUpdateInput) => {
    return prisma.product.update({
        where: { id },
        data,
    });
};

export const deleteProduct = async (id: string) => {
    return prisma.product.delete({
        where: { id },
    });
};
