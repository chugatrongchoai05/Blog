import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import slugify from 'slugify';

export async function createPost(req: Request, res: Response) {
    try {
        const { title, content, categoryId, tagIds } = req.body;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing elements to create a post.'
            });
        }
        if (tagIds !== undefined && (!Array.isArray(tagIds) || !tagIds.every(id => typeof id === 'string'))) {
            return res.status(400).json({
                success: false,
                message: 'Tag ID must be an array of strings.'
            });
        }
        const authorId = req.userId;
        if (!authorId) {
            return res.status(400).json({
                success: false,
                message: 'Missing author information.'
            });
        }
        const baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.post.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        const post = await prisma.post.create({
            data: {
                title,
                slug,
                content,
                authorId,
                categoryId,
                published: true,
                // use 'connect' to add to existing list
                tags: tagIds && tagIds.length > 0 
                ? { connect: tagIds.map((id: string) => ({ id })) }
                : undefined
            },
            include: {
                author: { select: { id: true, name: true }},
                category: true,
                tags: true
            }
        });
        return res.status(201).json({
            success: true,
            message: 'Post created successfully.',
            data: post
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return res.status(401).json({
                success: false,
                message: 'Author no longer exists.'
            });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(400).json({
                success: false,
                message: 'Tags do not exist.'
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function getAllPosts(req: Request, res: Response) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (!Number.isInteger(page) || page <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid page number.'
            });
        }
        if (!Number.isInteger(limit) || limit <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid limit number.'
            });
        }
        const { search, categoryId } = req.query;
        const where: Prisma.PostWhereInput = { published: true };
        if (categoryId) {
            where.categoryId = categoryId as string;
        }
        if (search) {
            where.title = { contains: search as string };
        }
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: { author: { select: { id: true, name: true }}, category: true, tags: true }
            }),
            prisma.post.count({ where })
        ]);
        return res.status(200).json({
            success: true,
            data: posts,
            pagination: { page, limit, total, totalPages: Math.ceil(total/limit) }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function getPostById(req: Request, res: Response) {
    const id = req.params.id;
    if (typeof id !== 'string' || id.length <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID.'
        });
    }
    try {
        const post = await prisma.post.findUnique({
            where: { id, published: true },
            include: {
                author: { select: { id: true, name: true, email: true }},
                category: true,
                tags: true,
            }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }
        return res.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function updatePost(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        if (typeof id !== 'string' || id.length <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID.'
            });
        }
        const existing = await prisma.post.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }
        if (existing.authorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own post.'
            });
        }
        const { title, content, categoryId, tagIds } = req.body;
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required.'
            });
        }
        if (tagIds !== undefined && (!Array.isArray(tagIds) || !tagIds.every(id => typeof id === 'string'))) {
            return res.status(400).json({
                success: false,
                message: 'Tag ID must be an array of strings.'
            });
        }
        if (categoryId !== undefined && categoryId !== null && typeof categoryId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Category ID must be a string or null.'
            });
        }
        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                category: categoryId !== undefined
                ? (categoryId === null
                    ? { disconnect: true }
                    : { connect: { id: categoryId } })
                : undefined,
                // use 'set' to replace entire list
                tags: tagIds !== undefined
                ? { set: tagIds.map((tagId: string) => ({ id: tagId })) }
                : undefined
            },
            include: {
                author: { select: { id: true, name: true }},
                category: true,
                tags: true
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Post updated.',
            post
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(400).json({
                success: false,
                message: 'Categories or tags do not exist.'
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function deletePost(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        if (typeof id !== 'string' || id.length <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID.'
            });
        }
        const existing = await prisma.post.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }
        if (existing.authorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own post.'
            });
        }
        await prisma.post.delete({
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