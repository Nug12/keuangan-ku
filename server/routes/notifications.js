import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// List notifications
router.get('/', (req, res) => {
    const notifications = db.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    `).all(req.user.id);

    res.json(notifications);
});

// Mark as read
router.put('/:id/read', (req, res) => {
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);

    res.json({ message: 'Notification marked as read' });
});

// Delete notification
router.delete('/:id', (req, res) => {
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);

    res.json({ message: 'Notification deleted' });
});

// Create notification (internal use)
export function createNotification(userId, type, message) {
    const id = uuidv4();
    db.prepare('INSERT INTO notifications (id, user_id, type, message) VALUES (?, ?, ?, ?)')
        .run(id, userId, type, message);
}

export default router;
