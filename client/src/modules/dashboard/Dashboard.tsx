import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Users, Briefcase, ArrowRightLeft, DollarSign,
    TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { getDashboardStats } from './dashboard.api.ts';

const COLORS = {
    primary: '#1e3a5f',
    secondary: '#3374ad',
    accent: '#d4af37',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
};

const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.error];

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function Dashboard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: getDashboardStats,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load dashboard data</p>
            </div>
        );
    }

    const { stats, monthlyData, statusDistribution, productDistribution, topClients, recentTransactions } = data;

    const statCards = [
        {
            name: 'Total Clients',
            value: stats.totalClients,
            subValue: `${stats.activeClients} active`,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+12%',
            trendUp: true,
        },
        {
            name: 'Financial Products',
            value: stats.totalProducts,
            subValue: 'Active offerings',
            icon: Briefcase,
            color: 'bg-amber-500',
            trend: '+3',
            trendUp: true,
        },
        {
            name: 'Total Transactions',
            value: stats.totalTransactions,
            subValue: `${stats.pendingTransactions} processing`,
            icon: ArrowRightLeft,
            color: 'bg-emerald-500',
            trend: '+8%',
            trendUp: true,
        },
        {
            name: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            subValue: `${formatCurrency(stats.monthlyRevenue)} this month`,
            icon: DollarSign,
            color: 'bg-slate-700',
            trend: '+15%',
            trendUp: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome back. Here's your business overview.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Last updated</p>
                    <p className="text-sm font-medium text-slate-700">
                        {new Date().toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {stat.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-slate-500">{stat.name}</h3>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                <p className="text-sm text-slate-500 mt-1">{stat.subValue}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Volume Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Transaction Volume</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="transactions"
                                    stroke={COLORS.primary}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorTransactions)"
                                    name="Transactions"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="#64748b"
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill={COLORS.accent} radius={[4, 4, 0, 0]} name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Transaction Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {statusDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {statusDistribution.map((item, index) => (
                            <div key={item.status} className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    {index === 0 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    {index === 1 && <Clock className="h-4 w-4 text-amber-500" />}
                                    {index === 2 && <XCircle className="h-4 w-4 text-red-500" />}
                                    <span className="text-sm font-medium text-slate-700">{item.percentage}%</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{item.status}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Financial Products</h3>
                    <div className="space-y-4">
                        {productDistribution.slice(0, 5).map((product, index) => (
                            <div key={product.sku} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-slate-600">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500">{product.transactionCount} transactions</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(product.totalRevenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Clients */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Clients</h3>
                    <div className="space-y-4">
                        {topClients.map((client, index) => (
                            <div key={client.id} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-white">
                                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
                                    <p className="text-xs text-slate-500">{client.transactionCount} transactions</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(client.totalSpent)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {recentTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-slate-600">
                                            #{transaction.id.substring(0, 8).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{transaction.clientName}</p>
                                            <p className="text-xs text-slate-500">{transaction.clientEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {transaction.productCount} {transaction.productCount === 1 ? 'product' : 'products'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-slate-900">
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            transaction.status === 'COMPLETED'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : transaction.status === 'PENDING'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {transaction.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                                            {transaction.status === 'PENDING' && <Clock className="h-3 w-3" />}
                                            {transaction.status === 'CANCELLED' && <XCircle className="h-3 w-3" />}
                                            {transaction.status === 'COMPLETED' ? 'Processed' :
                                                transaction.status === 'PENDING' ? 'Processing' : 'Declined'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(transaction.date)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
