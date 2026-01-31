import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Building2, Shield, ArrowLeft } from 'lucide-react';
import { createCustomer, updateCustomer, getCustomerById } from './customers.api.ts';
import type { CreateCustomerInput } from './customers.types.ts';

function CustomerForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<CreateCustomerInput>({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'ACTIVE',
    });

    const { data: customer } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => getCustomerById(id!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone || '',
                address: customer.address || '',
                status: customer.status,
            });
        }
    }, [customer]);

    const createMutation = useMutation({
        mutationFn: createCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            navigate('/customers');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateCustomerInput>) => updateCustomer(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            navigate('/customers');
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
                onClick={() => navigate('/customers')}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Clients
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
                    <h1 className="text-xl font-semibold text-white">
                        {isEdit ? 'Edit Client Profile' : 'New Client Onboarding'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                        {isEdit ? 'Update client information and account details' : 'Register a new business client in the system'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Contact Information Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                        Client Name / Business Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="Apex Technologies Inc."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="finance@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                            placeholder="(212) 555-0100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business Address Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Business Address
                            </h3>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                </div>
                                <textarea
                                    name="address"
                                    id="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                                    placeholder="350 Park Avenue, New York, NY 10022"
                                />
                            </div>
                        </div>

                        {/* Account Status Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Account Status
                            </h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                </div>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors appearance-none bg-white"
                                >
                                    <option value="ACTIVE">Verified - Full Account Access</option>
                                    <option value="INACTIVE">Pending Review - Limited Access</option>
                                </select>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Verified accounts have full access to all banking services and products.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/customers')}
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
                            ) : isEdit ? 'Update Client' : 'Complete Onboarding'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CustomerForm;
