import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { env } from '../config/env.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function register (req: Request, res: Response) {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, password: hashedPassword, email },
            select: { id: true, name: true, email: true }
        });
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: user
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists.'
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};

export async function login (req: Request, res: Response) {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }
        const user = await prisma.user.findUnique({
            where: { email: email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email or password is incorrect.'
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email or password is incorrect.'
            });
        }
        const accessToken = jwt.sign(
            { userId: user.id },
            env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const refreshTokenValue = crypto.randomBytes(40).toString('hex');
        await prisma.refreshToken.create({
            data: {
                token: refreshTokenValue,
                userId: user.id,
                expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXP)
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Login successfully.',
            accessToken: accessToken,
            refreshToken: refreshTokenValue
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function me (req: Request, res: Response) {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true }
    });
    res.status(200).json(user);
}

export async function refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required.'
            });
        }
        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });
        if (!stored) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token.'
            });
        }
        if (stored.expiresAt < new Date()) {
            await prisma.refreshToken.delete({
                where: { token: refreshToken }
            });
            return res.status(401).json({
                success: false,
                message: 'Refresh token has expired.'
            });
        }
        const accessToken = jwt.sign(
            { userId: stored.userId },
            env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        return res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
}

export async function logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required.'
            });
        }
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
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