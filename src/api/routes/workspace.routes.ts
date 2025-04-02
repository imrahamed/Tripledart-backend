import express from 'express';
import { 
  getWorkspaces, 
  getWorkspace, 
  createWorkspace, 
  updateWorkspace, 
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember
} from '../controllers/workspace.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = express.Router();

// All workspace routes require authentication
router.use(authenticate);

// Get all workspaces for the current user
router.get('/', getWorkspaces);

// Get a specific workspace by ID
router.get('/:id', getWorkspace);

// Create a new workspace
router.post('/', createWorkspace);

// Update a workspace
router.patch('/:id', updateWorkspace);

// Delete a workspace
router.delete('/:id', deleteWorkspace);

// Member management
router.post('/:id/members', addWorkspaceMember);
router.delete('/:id/members/:memberId', removeWorkspaceMember);

export default router; 