import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// List budgets
router.get('/', (req, res) => {
    const budgets = db.prepare(`
        SELECT b.*, p.name as pocket_name, p.icon as pocket_icon, p.color as pocket_color
        FROM budgets b
        JOIN pockets p ON b.pocket_id = p.id
        WHERE b.user_id = ?
    `).all(req.user.id);

    // Calculate spent amount for each budget
    const budgetsWithSpent = budgets.map(budget => {
        const start = budget.start_date || new Date().toISOString().split('T')[0];
        const end = budget.end_date || new Date().toISOString().split('T')[0];

        const spent = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE pocket_id = ? AND type = 'expense' AND created_at >= ? AND created_at <= ?
        `).get(budget.pocket_id, start, end);

        return { ...budget, spent: spent.total };
    });

    res.json(budgetsWithSpent);
});

// Create budget
router.post('/', (req, res) => {
    const { pocket_id, amount, period, start_date, end_date } = req.body;

    if (!pocket_id || !amount || !period) {
        return res.status(400).json({ error: 'pocket_id, amount, and period are required' });
    }

    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(pocket_id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO budgets (id, user_id, pocket_id, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, req.user.id, pocket_id, amount, period, start_date, end_date);

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.status(201).json(budget);
});

// Update budget
router.put('/:id', (req, res) => {
    const { amount, period, start_date, end_date } = req.body;

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('UPDATE budgets SET amount = ?, period = ?, start_date = ?, end_date = ? WHERE id = ?')
        .run(amount || budget.amount, period || budget.period, start_date || budget.start_date, end_date || budget.end_date, req.params.id);

    const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// Delete budget
router.delete('/:id', (req, res) => {
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
    res.json({ message: 'Budget deleted' });
});

export default router;
