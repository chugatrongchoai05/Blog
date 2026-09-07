import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

export async function createComment(req: Request, res: Response) {
    const postId = req.params.postId as string; // route: /api/posts/:postId/comments
    const { content } = req.body;
    const authorId = req.userId;
    try {
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Missing post ID.'
            });
        }
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Missing content to create a comment.'
            });
        }
        if (!authorId) {
            return res.status(400).json({
                success: false,
                message: 'Missing author information.'
            });
        }
        const existing = await prisma.post.findUnique({
            where: { id: postId }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }
        const comment = await prisma.comment.create({
            data: { content, postId, authorId },
            include: { author: { select: { id: true, name: true }}}
        });
        return res.status(201).json({
            success: true,
            message: 'Comment created successfully.',
            data: comment
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return res.status(401).json({
                success: false,
                message: 'Author no longer exists.'
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function getCommentsByPost(req: Request, res: Response) {
    const postId = req.params.postId as string;
    try {
        const existing = await prisma.post.findUnique({
            where: { id: postId }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: { author: { select: { id: true, name: true }}}
        });
        return res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function updateComment(req: Request, res: Response) {
    const id = req.params.id as string;
    const { content } = req.body;
    try {
        if (typeof id !== 'string' || id.length <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID.'
            });
        }
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Missing comment content.'
            });
        }
        const existing = await prisma.comment.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.'
            });
        }
        if (existing.authorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own comment.'
            });
        }
        const comment = await prisma.comment.update({
            where: { id },
            data: { content }
        });
        return res.status(200).json({
            success: true,
            message: 'Comment updated.',
            comment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function deleteComment(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
        if (typeof id !== 'string' || id.length <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID.'
            });
        }
        const existing = await prisma.comment.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.'
            });
        }
        if (existing.authorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comment.'
            });
        }
        await prisma.comment.delete({
            where: { id }
        });
        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}
