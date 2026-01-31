import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Tag, FileText, DollarSign, Package, ArrowLeft } from 'lucide-react';
import { createProduct, updateProduct, getProductById } from './products.api.ts';
import type { CreateProductInput } from './products.types.ts';

function ProductForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<CreateProductInput>({
        sku: '',
        name: '',
        description: '',
        price: 0,
        stock: 0,
    });

    const { data: product } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                price: parseFloat(product.price),
                stock: product.stock,
            });
        }
    }, [product]);

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/products');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateProductInput>) => updateProduct(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            navigate('/products');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
                    <h1 className="text-xl font-semibold text-white">
                        {isEdit ? 'Edit Financial Product' : 'New Financial Product'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                        {isEdit ? 'Update product details and pricing' : 'Add a new product to your banking portfolio'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Product Identification */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Product Identification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-1">
                                        Product Code (SKU)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="sku"
                                            id="sku"
                                            required
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="LND-LOC-001"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Use prefixes: DEP- (Deposits), LND- (Lending), TRS- (Treasury), CRD- (Cards), INV- (Investments)
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                        Product Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="Business Line of Credit"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Product Description
                            </h3>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                </div>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                    placeholder="Detailed description of the financial product, including key features, benefits, and terms..."
                                />
                            </div>
                        </div>

                        {/* Pricing & Availability */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Pricing & Availability
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                                        Rate / Limit / Fee
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            id="price"
                                            required
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Enter APY for deposits, credit limit for lending, or transaction fee
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-1">
                                        Availability / Capacity
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Package className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="stock"
                                            id="stock"
                                            required
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Number of accounts/units available for this product
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="px-4 py-2.5 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
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
                            ) : isEdit ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductForm;
