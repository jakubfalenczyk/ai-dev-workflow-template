import apiClient from '../../lib/apiClient.ts';
import type { Order, CreateOrderInput } from './orders.types.ts';

export const getOrders = async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
};

export const createOrder = async (data: CreateOrderInput): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
};
