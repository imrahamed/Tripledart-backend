import express from 'express';
import { registerUser, loginUser, requestPasswordReset, resetPassword, changePassword } from '../controllers/authController';
import { authenticate } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);

export default router;
