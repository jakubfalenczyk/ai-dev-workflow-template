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

export interface DashboardData {
    stats: DashboardStats;
    monthlyData: MonthlyData[];
    statusDistribution: StatusDistribution[];
    productDistribution: ProductDistribution[];
    topClients: TopClient[];
    recentTransactions: RecentTransaction[];
}
