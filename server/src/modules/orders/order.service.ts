import prisma from '../../prisma';
import { Prisma } from '@prisma/client';

interface CreateOrderInput {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

export const createOrder = async (data: CreateOrderInput) => {
    return prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of data.items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            await tx.product.update({
                where: { id: item.productId },
                data: { stock: product.stock - item.quantity },
            });

            const itemTotal = Number(product.price) * item.quantity;
            totalAmount += itemTotal;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            });
        }

        const order = await tx.order.create({
            data: {
                customerId: data.customerId,
                totalAmount,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return order;
    });
};

export const getOrders = async () => {
    return prisma.order.findMany({
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getOrderById = async (id: string) => {
    return prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
};
