import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Daily summary
router.get('/summary', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const income = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ? AND type = 'income' AND DATE(created_at) = ?
    `).get(req.user.id, today);

    const expense = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND DATE(created_at) = ?
    `).get(req.user.id, today);

    const totalBalance = db.prepare(`
        SELECT COALESCE(SUM(balance), 0) as total
        FROM pockets
        WHERE user_id = ?
    `).get(req.user.id);

    res.json({
        date: today,
        income: income.total,
        expense: expense.total,
        net: income.total - expense.total,
        totalBalance: totalBalance.total,
    });
});

// Weekly summary
router.get('/weekly', (req, res) => {
    const weeks = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weeks.push(date.toISOString().split('T')[0]);
    }

    const data = weeks.map(date => {
        const income = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'income' AND DATE(created_at) = ?
        `).get(req.user.id, date);

        const expense = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'expense' AND DATE(created_at) = ?
        `).get(req.user.id, date);

        return {
            date,
            income: income.total,
            expense: expense.total,
        };
    });

    res.json(data);
});

// Monthly summary
router.get('/monthly', (req, res) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
        });
    }

    const data = months.map(({ year, month }) => {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const income = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'income' AND DATE(created_at) >= ? AND DATE(created_at) <= ?
        `).get(req.user.id, startDate, endDate);

        const expense = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'expense' AND DATE(created_at) >= ? AND DATE(created_at) <= ?
        `).get(req.user.id, startDate, endDate);

        return {
            month: `${year}-${String(month).padStart(2, '0')}`,
            income: income.total,
            expense: expense.total,
        };
    });

    res.json(data);
});

// By category
router.get('/by-category', (req, res) => {
    const data = db.prepare(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND category IS NOT NULL
        GROUP BY category
        ORDER BY total DESC
    `).all(req.user.id);

    res.json(data);
});

// By pocket
router.get('/by-pocket', (req, res) => {
    const data = db.prepare(`
        SELECT p.name, p.icon, p.color, COALESCE(SUM(t.amount), 0) as total
        FROM pockets p
        LEFT JOIN transactions t ON p.id = t.pocket_id AND t.type = 'expense'
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY total DESC
    `).all(req.user.id);

    res.json(data);
});

// Export data
router.get('/export', (req, res) => {
    const { start_date, end_date, format } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (start_date) {
        query += ' AND created_at >= ?';
        params.push(start_date);
    }

    if (end_date) {
        query += ' AND created_at <= ?';
        params.push(end_date);
    }

    query += ' ORDER BY created_at DESC';

    const transactions = db.prepare(query).all(...params);

    res.json(transactions);
});

export default router;
