import express from 'express';
import { register, login, me, refresh, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
