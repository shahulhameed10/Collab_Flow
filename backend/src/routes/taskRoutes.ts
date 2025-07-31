import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask,updateTaskStatus } from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Roles } from '../constants/roles';

const router = Router();

// Create Task 
router.post('/', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MANAGER, Roles.DEVELOPER), createTask);

// Get All Tasks
router.get('/', authenticateToken, getTasks);

// Update Task 
router.put('/:id', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MANAGER, Roles.DEVELOPER), updateTask);

// Delete Task 
router.delete('/:id', authenticateToken, authorizeRoles(Roles.ADMIN, Roles.MANAGER), deleteTask);
// Update status
router.put('/:id/status', updateTask);


export default router;
