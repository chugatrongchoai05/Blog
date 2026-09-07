import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

export async function getAllTags(req: Request, res: Response) {
    try {
        const tags = await prisma.tag.findMany({
            select: { id: true, name: true }
        });
        return res.status(200).json({
            success: true,
            count: tags.length,
            tags
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function createTag(req: Request, res: Response) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Tag name is required.'
            });
        }
        const tag = await prisma.tag.create({
            data: { name }
        });
        return res.status(201).json({
            success: true,
            message: 'Tag created successfully.',
            tag
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    message: 'Tag already exists.'
                });
            }
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}