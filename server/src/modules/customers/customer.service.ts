import prisma from '../../prisma';
import { Prisma } from '@prisma/client';

export const createCustomer = async (data: Prisma.CustomerCreateInput) => {
    return prisma.customer.create({
        data,
    });
};

export const getCustomers = async () => {
    return prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const getCustomerById = async (id: string) => {
    return prisma.customer.findUnique({
        where: { id },
    });
};

export const updateCustomer = async (id: string, data: Prisma.CustomerUpdateInput) => {
    return prisma.customer.update({
        where: { id },
        data,
    });
};

export const deleteCustomer = async (id: string) => {
    return prisma.customer.delete({
        where: { id },
    });
};
