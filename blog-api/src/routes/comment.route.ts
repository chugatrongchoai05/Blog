import express from 'express';
import { createComment, getCommentsByPost, updateComment, deleteComment } from '../controllers/comment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const postCommentRouter = express.Router({ mergeParams: true });
postCommentRouter.get('/', getCommentsByPost);
postCommentRouter.post('/', authenticate, createComment);

const commentRouter = express.Router();
commentRouter.put('/:id', authenticate, updateComment);
commentRouter.delete('/:id', authenticate, deleteComment);

export default commentRouter;
