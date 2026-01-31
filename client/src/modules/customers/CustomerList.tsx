import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Building2, Mail, Phone, CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import { getCustomers, deleteCustomer } from './customers.api.ts';

function CustomerList() {
    const queryClient = useQueryClient();
    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    const activeCount = customers?.filter(c => c.status === 'ACTIVE').length || 0;
    const totalCount = customers?.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Client Portfolio</h1>
                    <p className="mt-1 text-sm text-slate-600">Manage your business client accounts and relationships</p>
                </div>
                <Link
                    to="/customers/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <UserPlus className="h-4 w-4" />
                    Onboard Client
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
                            <p className="text-sm text-slate-500">Total Clients</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                            <p className="text-sm text-slate-500">Active Accounts</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{totalCount - activeCount}</p>
                            <p className="text-sm text-slate-500">Pending Review</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Business Address
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Account Status
                                </th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {customers?.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-semibold text-white">
                                                    {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                                                <p className="text-xs text-slate-500">ID: {customer.id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                {customer.email}
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.address ? (
                                            <div className="flex items-start gap-2 text-sm text-slate-600 max-w-xs">
                                                <Building2 className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <span className="truncate">{customer.address}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">Not provided</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            customer.status === 'ACTIVE'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {customer.status === 'ACTIVE' ? (
                                                <CheckCircle2 className="h-3 w-3" />
                                            ) : (
                                                <Clock className="h-3 w-3" />
                                            )}
                                            {customer.status === 'ACTIVE' ? 'Verified' : 'Pending Review'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/customers/${customer.id}/edit`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to remove this client?')) {
                                                        deleteMutation.mutate(customer.id);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers?.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No clients</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by onboarding a new client.</p>
                        <div className="mt-6">
                            <Link
                                to="/customers/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <UserPlus className="h-4 w-4" />
                                Onboard Client
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerList;
