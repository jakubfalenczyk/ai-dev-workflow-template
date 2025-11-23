import { Request, Response, NextFunction } from 'express';
import * as customerService from './customer.service';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (error) {
        next(error);
    }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customers = await customerService.getCustomers();
        res.json(customers);
    } catch (error) {
        next(error);
    }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        next(error);
    }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        res.json(customer);
    } catch (error) {
        next(error);
    }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await customerService.deleteCustomer(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
