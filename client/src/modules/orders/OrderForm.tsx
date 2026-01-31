import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Briefcase, Plus, Minus, ArrowLeft, Calculator } from 'lucide-react';
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
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
        }, 0);
    };

    const formatCurrency = (value: number): string => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
        }
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value.toFixed(2)}`;
    };

    const activeCustomers = customers?.filter(c => c.status === 'ACTIVE') || [];
    const isLoading = createMutation.isPending;
    const total = calculateTotal();

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Transactions
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
                    <h1 className="text-xl font-semibold text-white">New Transaction</h1>
                    <p className="mt-1 text-sm text-slate-300">Create a new financial transaction for a client</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Client Selection */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Select Client
                            </h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-4 w-4 text-slate-400" />
                                </div>
                                <select
                                    id="customer"
                                    name="customer"
                                    required
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors appearance-none bg-white"
                                >
                                    <option value="">Select a client account...</option>
                                    {activeCustomers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} - {customer.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Only verified client accounts are shown
                            </p>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Financial Products
                            </h3>
                            <div className="space-y-3">
                                {items.map((item, index) => {
                                    const selectedProduct = products?.find(p => p.id === item.productId);
                                    return (
                                        <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors appearance-none bg-white"
                                                        required
                                                    >
                                                        <option value="">Select a product...</option>
                                                        {products?.map((product) => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name} ({product.sku})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {selectedProduct && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {selectedProduct.description?.substring(0, 80)}...
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-xs text-slate-500 mb-1">Units</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-center"
                                                    required
                                                />
                                            </div>
                                            <div className="w-28 text-right">
                                                <label className="block text-xs text-slate-500 mb-1">Subtotal</label>
                                                <p className="py-2.5 text-sm font-semibold text-slate-900">
                                                    {selectedProduct
                                                        ? formatCurrency(parseFloat(selectedProduct.price) * item.quantity)
                                                        : '$0.00'}
                                                </p>
                                            </div>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="mt-6 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add Another Product
                            </button>
                        </div>

                        {/* Transaction Summary */}
                        <div className="border-t border-slate-200 pt-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Transaction Summary
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calculator className="h-5 w-5" />
                                        <span className="font-medium">Total Transaction Amount</span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    This transaction will be processed and added to the client's account history.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/orders')}
                            className="px-4 py-2.5 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !customerId || items.every(i => !i.productId)}
                            className="px-6 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Submit Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OrderForm;
