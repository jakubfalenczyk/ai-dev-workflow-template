import { Router } from 'express';
import * as orderController from './order.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema } from './order.schema';

const router = Router();

router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
