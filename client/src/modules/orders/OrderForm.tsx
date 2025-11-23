import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder } from './orders.api.ts';
import { getCustomers } from '../customers/customers.api.ts';
import { getProducts } from '../products/products.api.ts';
import type { CreateOrderInput } from './orders.types.ts';

function OrderForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
        { productId: '', quantity: 1 },
    ]);

    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const createMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            navigate('/orders');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const orderData: CreateOrderInput = {
            customerId,
            items: items.filter(item => item.productId && item.quantity > 0),
        };
        createMutation.mutate(orderData);
    };

    const addItem = () => {
        setItems([...items, { productId: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const product = products?.find(p => p.id === item.productId);
            if (product) {
                return total + (parseFloat(product.price) * item.quantity);
            }
            return total;
        }, 0).toFixed(2);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">New Order</h3>
                    <p className="mt-1 text-sm text-gray-600">Create a new order for a customer</p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <div className="shadow sm:rounded-md sm:overflow-hidden">
                            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                                <div>
                                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                                        Customer
                                    </label>
                                    <select
                                        id="customer"
                                        name="customer"
                                        required
                                        value={customerId}
                                        onChange={(e) => setCustomerId(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                    >
                                        <option value="">Select a customer</option>
                                        {customers?.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-4 mb-3">
                                            <select
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                className="flex-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                                required
                                            >
                                                <option value="">Select a product</option>
                                                {products?.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} (${product.price}) - Stock: {product.stock}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                className="w-24 block px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                                placeholder="Qty"
                                                required
                                            />
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Item
                                    </button>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-lg font-medium">
                                        <span>Total:</span>
                                        <span>${calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/orders')}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create Order
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default OrderForm;
