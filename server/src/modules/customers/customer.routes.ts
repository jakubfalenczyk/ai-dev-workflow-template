import { Router } from 'express';
import * as customerController from './customer.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema';

const router = Router();

router.post('/', validateRequest(createCustomerSchema), customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', validateRequest(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
