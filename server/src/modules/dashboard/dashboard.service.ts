import prisma from '../../prisma';

export interface DashboardStats {
    totalClients: number;
    activeClients: number;
    totalProducts: number;
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    totalRevenue: number;
    monthlyRevenue: number;
}

export interface MonthlyData {
    month: string;
    transactions: number;
    revenue: number;
}

export interface StatusDistribution {
    status: string;
    count: number;
    percentage: number;
}

export interface ProductDistribution {
    name: string;
    sku: string;
    transactionCount: number;
    totalRevenue: number;
}

export interface TopClient {
    id: string;
    name: string;
    email: string;
    transactionCount: number;
    totalSpent: number;
}

export interface RecentTransaction {
    id: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    status: string;
    date: string;
    productCount: number;
}

export const getStats = async (): Promise<DashboardStats> => {
    const [
        totalClients,
        activeClients,
        totalProducts,
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        revenueResult,
        monthlyRevenueResult,
    ] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'COMPLETED' },
        }),
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: 'COMPLETED',
                orderDate: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
    ]);

    return {
        totalClients,
        activeClients,
        totalProducts,
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        totalRevenue: Number(revenueResult._sum.totalAmount || 0),
        monthlyRevenue: Number(monthlyRevenueResult._sum.totalAmount || 0),
    };
};

export const getTransactionsByMonth = async (): Promise<MonthlyData[]> => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
        where: {
            orderDate: { gte: twelveMonthsAgo },
        },
        select: {
            orderDate: true,
            totalAmount: true,
            status: true,
        },
    });

    // Group by month
    const monthlyMap = new Map<string, { transactions: number; revenue: number }>();

    // Initialize all 12 months
    for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(monthKey, { transactions: 0, revenue: 0 });
    }

    // Aggregate data
    for (const order of orders) {
        const date = new Date(order.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlyMap.get(monthKey);
        if (current) {
            current.transactions += 1;
            if (order.status === 'COMPLETED') {
                current.revenue += Number(order.totalAmount);
            }
        }
    }

    // Convert to array with formatted month names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from(monthlyMap.entries()).map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
            month: `${months[parseInt(month) - 1]} ${year.slice(2)}`,
            transactions: data.transactions,
            revenue: Math.round(data.revenue * 100) / 100,
        };
    });
};

export const getStatusDistribution = async (): Promise<StatusDistribution[]> => {
    const [completed, pending, cancelled, total] = await Promise.all([
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.order.count(),
    ]);

    if (total === 0) {
        return [
            { status: 'Processed', count: 0, percentage: 0 },
            { status: 'Processing', count: 0, percentage: 0 },
            { status: 'Declined', count: 0, percentage: 0 },
        ];
    }

    return [
        { status: 'Processed', count: completed, percentage: Math.round((completed / total) * 100) },
        { status: 'Processing', count: pending, percentage: Math.round((pending / total) * 100) },
        { status: 'Declined', count: cancelled, percentage: Math.round((cancelled / total) * 100) },
    ];
};

export const getProductDistribution = async (): Promise<ProductDistribution[]> => {
    const products = await prisma.product.findMany({
        include: {
            orderItems: {
                include: {
                    order: true,
                },
            },
        },
    });

    return products
        .map((product) => ({
            name: product.name,
            sku: product.sku,
            transactionCount: product.orderItems.length,
            totalRevenue: product.orderItems.reduce(
                (sum, item) => sum + Number(item.unitPrice) * item.quantity,
                0
            ),
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 8);
};

export const getTopClients = async (): Promise<TopClient[]> => {
    const clients = await prisma.customer.findMany({
        include: {
            orders: {
                where: { status: 'COMPLETED' },
            },
        },
    });

    return clients
        .map((client) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            transactionCount: client.orders.length,
            totalSpent: client.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);
};

export const getRecentTransactions = async (): Promise<RecentTransaction[]> => {
    const orders = await prisma.order.findMany({
        take: 10,
        orderBy: { orderDate: 'desc' },
        include: {
            customer: true,
            items: true,
        },
    });

    return orders.map((order) => ({
        id: order.id,
        clientName: order.customer.name,
        clientEmail: order.customer.email,
        amount: Number(order.totalAmount),
        status: order.status,
        date: order.orderDate.toISOString(),
        productCount: order.items.length,
    }));
};
