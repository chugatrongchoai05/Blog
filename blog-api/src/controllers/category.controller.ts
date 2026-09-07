import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

export async function getAllCategories(req: Request, res: Response) {
    try {
        const categories = await prisma.category.findMany({
            select: { id: true, name: true }
        });
        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function createCategory(req: Request, res: Response) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required.'
            });
        }
        const category = await prisma.category.create({
            data: { name }
        });
        return res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            category
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    message: 'Category already exists.'
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