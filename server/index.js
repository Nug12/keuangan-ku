import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mkdirSync } from 'fs';
import { join } from 'path';
import authRoutes from './routes/auth.js';
import pocketRoutes from './routes/pockets.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

// Ensure data directory exists
mkdirSync(join(process.cwd(), 'data'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pockets', pocketRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static frontend files
const publicPath = join(process.cwd(), 'public');
app.use(express.static(publicPath));

// SPA fallback — serve index.html for /app and sub-routes
app.get('/app', (req, res) => {
    res.sendFile(join(publicPath, 'index.html'));
});
app.use('/app', (req, res) => {
    res.sendFile(join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
