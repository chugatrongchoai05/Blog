import express from 'express';
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from '../controllers/post.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { postCommentRouter } from './comment.route.js';

const router = express.Router();

router.post('/', authenticate, createPost);
router.use('/:postId/comments', postCommentRouter);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;
