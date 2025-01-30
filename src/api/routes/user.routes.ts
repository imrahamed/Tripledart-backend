import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { UserController } from '../controllers/user.controller';

const router = Router();

// Only admin can create new users
router.post('/', authenticate, authorize(['admin']), UserController.createUser);

// Admin or brand can list all users
router.get('/', authenticate, authorize(['admin', 'brand']), UserController.listUsers);

// Any authenticated user can get their own info if IDs match, or admin can get any
router.get('/:id', authenticate, UserController.getUser);
router.put('/:id', authenticate, UserController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), UserController.deleteUser);

export default router;
