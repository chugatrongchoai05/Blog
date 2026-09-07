import { PrismaClient } from '../generated/prisma/client.js';

export const prisma = new PrismaClient();

async function testPrismaConnection() {
    try {
        await prisma.user.findMany({
            take: 1,
        });
        console.log('Prisma connected successfully.');
    } catch (error) {
        console.error('Failed to connect with Prisma.');
        console.error(error);
    }
};

testPrismaConnection();
