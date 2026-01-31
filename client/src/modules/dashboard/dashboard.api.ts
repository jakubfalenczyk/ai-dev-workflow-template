import apiClient from '../../lib/apiClient.ts';
import type { DashboardData } from './dashboard.types.ts';

export const getDashboardStats = async (): Promise<DashboardData> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
};
