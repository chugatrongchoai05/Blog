import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    DATABASE_URL: process.env.DATABASE_URL!,
    REFRESH_TOKEN_EXP: Number(process.env.REFRESH_TOKEN_EXP) || 7 * 24 * 60 * 60 * 1000,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
};