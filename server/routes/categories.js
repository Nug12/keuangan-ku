import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// List categories
router.get('/', (req, res) => {
    let categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY type DESC, name ASC')
        .all(req.user.id);

    if (categories.length === 0) {
        const defaultCats = [
            { name: 'Makanan', icon: 'fa-solid fa-utensils', type: 'expense' },
            { name: 'Transport', icon: 'fa-solid fa-car', type: 'expense' },
            { name: 'Belanja', icon: 'fa-solid fa-cart-shopping', type: 'expense' },
            { name: 'Tagihan', icon: 'fa-solid fa-file-invoice', type: 'expense' },
            { name: 'Hiburan', icon: 'fa-solid fa-gamepad', type: 'expense' },
            { name: 'Gaji', icon: 'fa-solid fa-money-bill', type: 'income' },
            { name: 'Freelance', icon: 'fa-solid fa-laptop-code', type: 'income' },
            { name: 'Lainnya', icon: 'fa-solid fa-box', type: 'expense' },
        ];
        const insert = db.prepare('INSERT INTO categories (id, user_id, name, icon, type) VALUES (?, ?, ?, ?, ?)');
        defaultCats.forEach(c => insert.run(uuidv4(), req.user.id, c.name, c.icon, c.type));
        categories = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY type DESC, name ASC').all(req.user.id);
    }

    res.json(categories);
});

// Create category
router.post('/', (req, res) => {
    const { name, icon, type } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO categories (id, user_id, name, icon, type) VALUES (?, ?, ?, ?, ?)')
        .run(id, req.user.id, name, icon || 'fa-solid fa-tag', type || 'expense');

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json(category);
});

// Update category
router.put('/:id', (req, res) => {
    const { name, icon, type } = req.body;
    const category = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare('UPDATE categories SET name = ?, icon = ?, type = ? WHERE id = ?')
        .run(name || category.name, icon || category.icon, type || category.type, req.params.id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// Delete category
router.delete('/:id', (req, res) => {
    const category = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted' });
});

export default router;
