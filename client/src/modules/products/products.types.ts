export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    price: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductInput {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock?: number;
}
