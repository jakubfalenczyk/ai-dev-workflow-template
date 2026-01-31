import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

import customerRoutes from './modules/customers/customer.routes';
import productRoutes from './modules/products/product.routes';
import orderRoutes from './modules/orders/order.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
