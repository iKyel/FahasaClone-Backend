import MoMoPaymentController from '../controllers/ThanhToan'; 
import express from 'express';

const router = express.Router();

router.post('/momo', MoMoPaymentController.createPayment);

export default router;