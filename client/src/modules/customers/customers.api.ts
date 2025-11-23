import apiClient from '../../lib/apiClient.ts';
import type { Customer, CreateCustomerInput } from './customers.types.ts';

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers');
    return response.data;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
};

export const createCustomer = async (data: CreateCustomerInput): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
};

export const updateCustomer = async (id: string, data: Partial<CreateCustomerInput>): Promise<Customer> => {
    const response = await apiClient.patch(`/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
};
