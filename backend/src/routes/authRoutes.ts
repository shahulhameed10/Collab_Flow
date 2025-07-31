import { Router } from 'express';
import { register, login, getProfile, getAllUsers, updateUser, deleteUser } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Roles } from '../constants/roles';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, getAllUsers);
router.put('/users/:id', authenticateToken, authorizeRoles(Roles.ADMIN), updateUser);
router.delete('/users/:id', authenticateToken, authorizeRoles(Roles.ADMIN), deleteUser);


// Admin-only user management route 
router.get('/admin/users', authenticateToken, authorizeRoles(Roles.ADMIN), (req, res) => {
    res.json({ message: 'Admin-only user management route' });
});

export default router;
