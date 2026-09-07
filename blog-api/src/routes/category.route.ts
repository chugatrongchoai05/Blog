import express from 'express';
import { getAllCategories, createCategory } from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', authenticate, createCategory);

export default router;
