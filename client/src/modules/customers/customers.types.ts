export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerInput {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}
