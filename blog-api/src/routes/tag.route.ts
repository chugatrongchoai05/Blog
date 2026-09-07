import express from 'express';
import { getAllTags, createTag } from '../controllers/tag.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllTags);
router.post('/', authenticate, createTag);

export default router;
