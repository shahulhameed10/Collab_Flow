import { Router } from 'express';
import { createWorkspace, getAllWorkspaces, updateWorkspace, deleteWorkspace } from '../controllers/workspaceController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Roles } from '../constants/roles';

const router = Router();


//create a new workspace
router.post(
    '/',
    authenticateToken,
    authorizeRoles(Roles.ADMIN, Roles.OWNER),
    createWorkspace
);

// get all workspace

router.get('/', authenticateToken, getAllWorkspaces);


//update workspace
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles(Roles.ADMIN, Roles.OWNER),
    updateWorkspace
);

// Only Admin can delete a workspace
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles(Roles.ADMIN,Roles.OWNER),
    deleteWorkspace
);

export default router;
