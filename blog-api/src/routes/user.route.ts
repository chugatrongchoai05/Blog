import express from 'express';
import { getAllUsers, getUserById, updateUser, patchUser, deleteUser } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', authenticate, updateUser);
router.patch('/:id', authenticate, patchUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
