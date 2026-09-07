import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true }
        });
        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function getUserById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (typeof id !== 'string' || id.length <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID.'
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function updateUser(req: Request, res: Response) {
    const id = req.params.id as string;
    if (typeof id !== 'string' || id.length <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID.'
        });
    }
    if (req.userId !== id) {
        return res.status(403).json({
            success: false,
            message: 'You can only update your own account.'
        });
    }
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: 'Name and email are required.'
        });
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email },
            select: { id: true, name: true, email: true },
        });
        return res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            updatedUser
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // not found
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }
            // conflict
            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists.'
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

export async function patchUser(req: Request, res: Response) {
    const id = req.params.id as string;
    if (typeof id !== 'string' || id.length <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID.'
        });
    }
    if (req.userId !== id) {
        return res.status(403).json({
            success: false,
            message: 'You can only update your own account.'
        });
    } 
    const { name, email } = req.body;
    if (name === undefined && email === undefined) {
        return res.status(400).json({
            success: false,
            message: 'At least one field is required.'
        });
    }
    const data: { name?: string; email?: string } = {};
    if (name !== undefined) { data.name = name }
    if (email !== undefined) { data.email = email }
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true }
        });
        return res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            updatedUser
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }
            if (error.code === 'P2002') {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists.'
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

export async function deleteUser(req: Request, res: Response) {
    const id = req.params.id as string;
    if (typeof id !== 'string' || id.length <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID.'
        });
    }
    if (req.userId !== id) {
        return res.status(403).json({
            success: false,
            message: 'You can only delete your own account.'
        });
    }
    try {
        await prisma.user.delete({
            where: { id }
        });
        return res.sendStatus(204);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}
