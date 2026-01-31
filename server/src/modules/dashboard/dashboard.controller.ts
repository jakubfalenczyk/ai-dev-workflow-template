import { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            stats,
            monthlyData,
            statusDistribution,
            productDistribution,
            topClients,
            recentTransactions,
        ] = await Promise.all([
            dashboardService.getStats(),
            dashboardService.getTransactionsByMonth(),
            dashboardService.getStatusDistribution(),
            dashboardService.getProductDistribution(),
            dashboardService.getTopClients(),
            dashboardService.getRecentTransactions(),
        ]);

        res.json({
            stats,
            monthlyData,
            statusDistribution,
            productDistribution,
            topClients,
            recentTransactions,
        });
    } catch (error) {
        next(error);
    }
};
