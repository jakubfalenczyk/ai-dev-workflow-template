import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, Plus, CheckCircle2, Clock, XCircle, DollarSign, TrendingUp, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus } from './orders.api.ts';
import type { Order } from './orders.types.ts';

function formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function OrderList() {
    const queryClient = useQueryClient();
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
            updateOrderStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            const action = variables.status === 'COMPLETED' ? 'processed' : 'declined';
            toast.success(`Transaction ${action} successfully`);
        },
        onError: () => {
            toast.error('Failed to update transaction status');
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    const completedOrders = orders?.filter(o => o.status === 'COMPLETED') || [];
    const pendingOrders = orders?.filter(o => o.status === 'PENDING') || [];
    const cancelledOrders = orders?.filter(o => o.status === 'CANCELLED') || [];

    const totalVolume = completedOrders.reduce((sum, o) => sum + parseFloat(String(o.totalAmount)), 0);
    const pendingVolume = pendingOrders.reduce((sum, o) => sum + parseFloat(String(o.totalAmount)), 0);

    const handleProcess = (orderId: string) => {
        updateStatusMutation.mutate({ id: orderId, status: 'COMPLETED' });
    };

    const handleDecline = (orderId: string) => {
        updateStatusMutation.mutate({ id: orderId, status: 'CANCELLED' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
                    <p className="mt-1 text-sm text-slate-600">View and manage all financial transactions</p>
                </div>
                <Link
                    to="/orders/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Transaction
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalVolume)}</p>
                            <p className="text-xs text-slate-500">Total Volume</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">{completedOrders.length}</p>
                            <p className="text-xs text-slate-500">Processed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">{pendingOrders.length}</p>
                            <p className="text-xs text-slate-500">Processing ({formatCurrency(pendingVolume)})</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">{cancelledOrders.length}</p>
                            <p className="text-xs text-slate-500">Declined</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ArrowRightLeft className="h-5 w-5 text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-900">All Transactions</h3>
                        <span className="text-sm text-slate-500">({orders?.length || 0} total)</span>
                    </div>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {orders?.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-slate-600">
                                            #{order.id.substring(0, 8).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold text-white">
                                                    {order.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{order.customer.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {order.items.length} {order.items.length === 1 ? 'product' : 'products'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm font-semibold text-slate-900">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            order.status === 'COMPLETED'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : order.status === 'PENDING'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {order.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                                            {order.status === 'PENDING' && <Clock className="h-3 w-3" />}
                                            {order.status === 'CANCELLED' && <XCircle className="h-3 w-3" />}
                                            {order.status === 'COMPLETED' ? 'Processed' :
                                                order.status === 'PENDING' ? 'Processing' : 'Declined'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(order.orderDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleProcess(order.id)}
                                                    disabled={updateStatusMutation.isPending}
                                                    className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50 text-sm font-medium"
                                                >
                                                    Process
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(order.id)}
                                                    disabled={updateStatusMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 text-sm font-medium"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders?.length === 0 && (
                    <div className="text-center py-12">
                        <ArrowRightLeft className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No transactions</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by creating a new transaction.</p>
                        <div className="mt-6">
                            <Link
                                to="/orders/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                New Transaction
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderList;
