import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// List pockets
router.get('/', (req, res) => {
    const pockets = db.prepare('SELECT * FROM pockets WHERE user_id = ? ORDER BY created_at DESC')
        .all(req.user.id);
    res.json(pockets);
});

// Get single pocket
router.get('/:id', (req, res) => {
    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    res.json(pocket);
});

// Create pocket
router.post('/', (req, res) => {
    const { name, icon, color } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO pockets (id, user_id, name, icon, color) VALUES (?, ?, ?, ?, ?)')
        .run(id, req.user.id, name, icon || '💰', color || '#87CEEB');

    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(id);
    res.status(201).json(pocket);
});

// Update pocket
router.put('/:id', (req, res) => {
    const { name, icon, color } = req.body;

    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    db.prepare('UPDATE pockets SET name = ?, icon = ?, color = ? WHERE id = ?')
        .run(name || pocket.name, icon || pocket.icon, color || pocket.color, req.params.id);

    const updated = db.prepare('SELECT * FROM pockets WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// Delete pocket
router.delete('/:id', (req, res) => {
    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    db.prepare('DELETE FROM pockets WHERE id = ?').run(req.params.id);
    res.json({ message: 'Pocket deleted' });
});

export default router;
