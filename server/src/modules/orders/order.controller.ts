import { Request, Response, NextFunction } from 'express';
import * as orderService from './order.service';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderService.getOrders();
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
        res.json(order);
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ message: 'Order not found' });
        }
        next(error);
    }
};
