import apiClient from '../../lib/apiClient.ts';
import type { Product, CreateProductInput } from './products.types.ts';

export const getProducts = async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
};

export const updateProduct = async (id: string, data: Partial<CreateProductInput>): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
};
