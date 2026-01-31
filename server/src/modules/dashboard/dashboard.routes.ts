import { Router } from 'express';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.get('/stats', dashboardController.getStats);

export default router;
