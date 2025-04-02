import express, { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    await AuthController.registerUser(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
    await AuthController.loginUser(req, res);
});

router.post('/request-reset', async (req: Request, res: Response) => {
    await AuthController.requestPasswordReset(req, res);
});

router.post('/reset-password', async (req: Request, res: Response) => {
    await AuthController.resetPassword(req, res);
});

router.post('/change-password', authenticate, async (req: Request, res: Response) => {
    await AuthController.changePassword(req, res);
});

router.post('/refresh', async (req: Request, res: Response) => {
    await AuthController.refreshToken(req, res);
});

export default router;
