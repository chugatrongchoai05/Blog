import express from 'express';
import { prisma } from './lib/prisma.js';
import { env } from './config/env.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import commentRouter from './routes/comment.route.js';
import categoryRouter from './routes/category.route.js';
import tagRouter from './routes/tag.route.js';
import cors from 'cors'

const app = express();
const PORT = env.PORT;

app.use(cors({ origin: env.ALLOWED_ORIGIN }))
app.use(express.json()); // middleware parses the JSON body and assigns it to `req.body`

// runtime check
app.get('/api/health', async (req, res) =>{
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            success: true,
            message: 'Server and database are running.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed.'
        });
    }
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/tags', tagRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
