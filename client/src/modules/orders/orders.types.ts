import type { Customer } from '../customers/customers.types.ts';
import type { Product } from '../products/products.types.ts';

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    product: Product;
    quantity: number;
    unitPrice: string;
}

export interface Order {
    id: string;
    customerId: string;
    customer: Customer;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    totalAmount: string;
    orderDate: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export interface CreateOrderInput {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}
