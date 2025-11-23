import { Router } from 'express';
import * as productController from './product.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from './product.schema';

const router = Router();

router.post('/', validateRequest(createProductSchema), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
