import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../customers/customers.api.ts';
import { getProducts } from '../products/products.api.ts';
import { getOrders } from '../orders/orders.api.ts';

function Dashboard() {
    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const { data: orders } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    });

    const stats = [
        {
            name: 'Total Customers',
            value: customers?.length || 0,
            description: 'Active customers in the system',
        },
        {
            name: 'Total Products',
            value: products?.length || 0,
            description: 'Products in inventory',
        },
        {
            name: 'Total Orders',
            value: orders?.length || 0,
            description: 'Orders placed',
        },
        {
            name: 'Low Stock Items',
            value: products?.filter(p => p.stock < 10).length || 0,
            description: 'Products with stock below 10',
        },
    ];

    const recentOrders = orders?.slice(0, 5) || [];

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-700">Overview of your business metrics</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
                                    </dl>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-sm text-gray-500">{stat.description}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Orders</h3>
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.customer.name}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${order.totalAmount}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
