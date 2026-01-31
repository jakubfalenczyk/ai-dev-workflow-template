import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, CreditCard, Landmark, TrendingUp, Wallet, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { getProducts, deleteProduct } from './products.api.ts';

// Map SKU prefixes to categories and icons
function getProductCategory(sku: string): { category: string; icon: typeof CreditCard; color: string } {
    if (sku.startsWith('DEP-')) return { category: 'Deposit Products', icon: Wallet, color: 'bg-blue-500' };
    if (sku.startsWith('LND-')) return { category: 'Lending Products', icon: Landmark, color: 'bg-emerald-500' };
    if (sku.startsWith('TRS-')) return { category: 'Treasury Services', icon: TrendingUp, color: 'bg-purple-500' };
    if (sku.startsWith('CRD-')) return { category: 'Card Products', icon: CreditCard, color: 'bg-amber-500' };
    if (sku.startsWith('INV-')) return { category: 'Investment Products', icon: TrendingUp, color: 'bg-slate-600' };
    return { category: 'Other', icon: Briefcase, color: 'bg-slate-500' };
}

function formatPrice(price: string | number, sku: string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Context-aware formatting based on product type
    if (sku.startsWith('DEP-SAV') || sku.startsWith('DEP-MMA') || sku.startsWith('DEP-CD')) {
        return `${numPrice.toFixed(2)}% APY`;
    }
    if (sku.startsWith('TRS-') && numPrice < 100) {
        return `$${numPrice.toFixed(2)} per transaction`;
    }
    if (numPrice === 0) {
        return 'No fee';
    }
    if (numPrice >= 1000000) {
        return `$${(numPrice / 1000000).toFixed(1)}M limit`;
    }
    if (numPrice >= 1000) {
        return `$${(numPrice / 1000).toFixed(0)}K limit`;
    }
    return `$${numPrice.toFixed(2)}`;
}

function ProductList() {
    const queryClient = useQueryClient();
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    // Group products by category
    const groupedProducts = products?.reduce((acc, product) => {
        const { category } = getProductCategory(product.sku);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, typeof products>);

    const categories = ['Deposit Products', 'Lending Products', 'Treasury Services', 'Card Products', 'Investment Products', 'Other'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Products & Services</h1>
                    <p className="mt-1 text-sm text-slate-600">Manage your portfolio of banking products and services</p>
                </div>
                <Link
                    to="/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {categories.slice(0, 5).map((cat) => {
                    const count = groupedProducts?.[cat]?.length || 0;
                    const { icon: Icon, color } = getProductCategory(
                        cat === 'Deposit Products' ? 'DEP-' :
                        cat === 'Lending Products' ? 'LND-' :
                        cat === 'Treasury Services' ? 'TRS-' :
                        cat === 'Card Products' ? 'CRD-' : 'INV-'
                    );
                    return (
                        <div key={cat} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className={`${color} p-2 rounded-lg`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{count}</p>
                                    <p className="text-xs text-slate-500 truncate">{cat.replace(' Products', '').replace(' Services', '')}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Product Cards by Category */}
            {categories.map((category) => {
                const categoryProducts = groupedProducts?.[category];
                if (!categoryProducts || categoryProducts.length === 0) return null;

                const { icon: CategoryIcon, color } = getProductCategory(
                    categoryProducts[0].sku
                );

                return (
                    <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className={`${color} p-2 rounded-lg`}>
                                    <CategoryIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                                    <p className="text-sm text-slate-500">{categoryProducts.length} products available</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {categoryProducts.map((product) => (
                                <div key={product.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-sm font-semibold text-slate-900">{product.name}</h4>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600">
                                                    {product.sku}
                                                </span>
                                            </div>
                                            {product.description && (
                                                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-4">
                                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                                                    {formatPrice(product.price, product.sku)}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    {product.stock} available
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Link
                                                to={`/products/${product.id}/edit`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to remove this product?')) {
                                                        deleteMutation.mutate(product.id);
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {products?.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">No financial products</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by adding a new product.</p>
                    <div className="mt-6">
                        <Link
                            to="/products/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductList;
