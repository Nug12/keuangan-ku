import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = Router();
router.use(authenticateToken);

// List transactions
router.get('/', (req, res) => {
    const { pocket_id, type, start_date, end_date } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (pocket_id) {
        query += ' AND (pocket_id = ? OR target_pocket_id = ?)';
        params.push(pocket_id, pocket_id);
    }

    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

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

// Create transaction (income/expense)
router.post('/', (req, res) => {
    const { pocket_id, type, amount, description, category } = req.body;

    if (!pocket_id || !type || !amount) {
        return res.status(400).json({ error: 'pocket_id, type, and amount are required' });
    }

    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'type must be income or expense' });
    }

    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(pocket_id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    const id = uuidv4();

    // Insert transaction
    db.prepare('INSERT INTO transactions (id, user_id, pocket_id, type, amount, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, req.user.id, pocket_id, type, amount, description, category);

    // Update pocket balance
    const newBalance = type === 'income' ? pocket.balance + amount : pocket.balance - amount;
    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?').run(newBalance, pocket_id);

    // Check budget warning for expense
    if (type === 'expense') {
        const budget = db.prepare('SELECT * FROM budgets WHERE pocket_id = ? AND user_id = ?')
            .get(pocket_id, req.user.id);

        if (budget) {
            const spent = db.prepare(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM transactions
                WHERE pocket_id = ? AND type = 'expense' AND created_at >= ? AND created_at <= ?
            `).get(pocket_id, budget.start_date || new Date().toISOString().split('T')[0], budget.end_date || new Date().toISOString().split('T')[0]);

            const percentage = (spent.total / budget.amount) * 100;
            if (percentage >= 80) {
                createNotification(req.user.id, 'budget_warning',
                    `Budget untuk kantong "${pocket.name}" sudah ${percentage.toFixed(0)}% terpakai!`);
            }
        }
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json(transaction);
});

// Transfer between pockets
router.post('/transfer', (req, res) => {
    const { from_pocket_id, to_pocket_id, amount, description } = req.body;

    if (!from_pocket_id || !to_pocket_id || !amount) {
        return res.status(400).json({ error: 'from_pocket_id, to_pocket_id, and amount are required' });
    }

    if (from_pocket_id === to_pocket_id) {
        return res.status(400).json({ error: 'Cannot transfer to same pocket' });
    }

    const fromPocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(from_pocket_id, req.user.id);

    const toPocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(to_pocket_id, req.user.id);

    if (!fromPocket || !toPocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    if (fromPocket.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    const id = uuidv4();

    // Insert transfer transaction
    db.prepare('INSERT INTO transactions (id, user_id, pocket_id, type, amount, description, target_pocket_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, req.user.id, from_pocket_id, 'transfer', amount, description, to_pocket_id);

    // Update balances
    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?')
        .run(fromPocket.balance - amount, from_pocket_id);
    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?')
        .run(toPocket.balance + amount, to_pocket_id);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json(transaction);
});

// Delete transaction
router.delete('/:id', (req, res) => {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);

    // Reverse balance change
    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(transaction.pocket_id);
    if (pocket) {
        let newBalance = pocket.balance;
        if (transaction.type === 'income') {
            newBalance -= transaction.amount;
        } else if (transaction.type === 'expense') {
            newBalance += transaction.amount;
        } else if (transaction.type === 'transfer') {
            newBalance += transaction.amount;
            // Reverse target pocket
            if (transaction.target_pocket_id) {
                const targetPocket = db.prepare('SELECT * FROM pockets WHERE id = ?')
                    .get(transaction.target_pocket_id);
                if (targetPocket) {
                    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?')
                        .run(targetPocket.balance - transaction.amount, transaction.target_pocket_id);
                }
            }
        }
        db.prepare('UPDATE pockets SET balance = ? WHERE id = ?').run(newBalance, transaction.pocket_id);
    }

    res.json({ message: 'Transaction deleted' });
});

export default router;
