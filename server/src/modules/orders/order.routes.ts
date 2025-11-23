import { Router } from 'express';
import * as orderController from './order.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderSchema } from './order.schema';

const router = Router();

router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

export default router;
