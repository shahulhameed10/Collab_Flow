import { Router } from 'express';
import {
  createProject,
  getProjectsByWorkspace,
  updateProject,
  deleteProject
} from '../controllers/projectController';

import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Roles } from '../constants/roles';

const router = Router();

// Create Project inside a specific workspace
router.post(
  '/',
  authenticateToken,
  authorizeRoles(Roles.ADMIN, Roles.OWNER, Roles.MANAGER),
  createProject
);

// Get Projects by Workspace ID
router.get(
  '/workspace/:workspaceId',
  authenticateToken,
  getProjectsByWorkspace
);

// Update Project
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(Roles.ADMIN, Roles.MANAGER),
  updateProject
);

// Delete Project
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(Roles.ADMIN),
  deleteProject
);

export default router;
