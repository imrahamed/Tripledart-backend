import express from 'express';
import {AuthController} from '../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);
router.post('/request-reset', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
