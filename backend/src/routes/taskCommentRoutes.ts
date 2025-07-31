import { Router } from 'express';
import { addComment, getComments } from '../controllers/taskComment';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/:taskId', authenticateToken, addComment);
router.get('/:taskId', authenticateToken, getComments);

export default router;
