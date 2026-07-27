import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { checkAndResetDemoDatabase } from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with authentication and requireAdmin
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/stats - Global application statistics
router.get('/stats', (req, res) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
        const totalVolume = db.prepare("SELECT SUM(amount) as sum FROM transactions WHERE type != 'transfer'").get().sum || 0;
        const totalPockets = db.prepare('SELECT COUNT(*) as count FROM pockets').get().count;
        const totalBudgets = db.prepare('SELECT COUNT(*) as count FROM budgets').get().count;
        
        let lastReset = null;
        try {
            const lastResetRow = db.prepare("SELECT value FROM app_metadata WHERE key = 'last_demo_reset'").get();
            if (lastResetRow) lastReset = parseInt(lastResetRow.value, 10);
        } catch (e) {}

        res.json({
            totalUsers,
            totalTransactions,
            totalVolume,
            totalPockets,
            totalBudgets,
            lastReset
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/users - Detailed list of users
router.get('/users', (req, res) => {
    try {
        const users = db.prepare(`
            SELECT 
                u.id, u.email, u.name, u.role, u.auth_provider, u.created_at,
                (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as transaction_count,
                (SELECT COUNT(*) FROM pockets WHERE user_id = u.id) as pocket_count,
                (SELECT COALESCE(SUM(balance), 0) FROM pockets WHERE user_id = u.id) as total_balance
            FROM users u
            ORDER BY u.created_at DESC
        `).all();

        res.json(users || []);
    } catch (err) {
        console.error('Error fetching admin users:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/users/:id/role - Update user role (admin vs user)
router.put('/users/:id/role', (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const targetUser = db.prepare('SELECT email FROM users WHERE id = ?').get(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
        res.json({ message: `Role updated to ${role}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/users/:id/password - Admin reset user password
router.put('/users/:id/password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.trim().length < 4) {
            return res.status(400).json({ error: 'New password must be at least 4 characters' });
        }

        const targetUser = db.prepare('SELECT email FROM users WHERE id = ?').get(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.hash(newPassword, 10);

        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
        res.json({ message: `Password for ${targetUser.email} updated successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', (req, res) => {
    try {
        const targetUser = db.prepare('SELECT email FROM users WHERE id = ?').get(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (targetUser.email === 'admin@nug12.biz.id') {
            return res.status(403).json({ error: 'Cannot delete primary admin account' });
        }

        const userId = req.params.id;
        db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM categories WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM pockets WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM users WHERE id = ?').run(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/broadcast-notification - Broadcast message to users
router.post('/broadcast-notification', (req, res) => {
    try {
        const { title, message, target } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Notification message is required' });
        }

        let users = [];
        if (target === 'demo') {
            users = db.prepare('SELECT id FROM users WHERE LOWER(email) IN (?, ?)').all('demo@nug12.biz.id', 'demo@keuanganku.com');
        } else if (target === 'regular') {
            users = db.prepare('SELECT id FROM users WHERE LOWER(email) NOT IN (?, ?)').all('demo@nug12.biz.id', 'demo@keuanganku.com');
        } else {
            // all users
            users = db.prepare('SELECT id FROM users').all();
        }

        const insertNotif = db.prepare('INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)');
        const notifTitle = title || 'Pengumuman Sistem';

        let count = 0;
        users.forEach(u => {
            insertNotif.run(uuidv4(), u.id, 'system_broadcast', notifTitle, message);
            count++;
        });

        res.json({ success: true, count, message: `Broadcast successfully sent to ${count} user(s)` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/broadcasts - History of sent broadcast notifications
router.get('/broadcasts', (req, res) => {
    try {
        const broadcasts = db.prepare(`
            SELECT 
                title, message, created_at,
                COUNT(*) as total_sent,
                SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as total_read,
                GROUP_CONCAT(id) as notif_ids
            FROM notifications
            WHERE type = 'system_broadcast'
            GROUP BY title, message, created_at
            ORDER BY created_at DESC
        `).all();

        res.json(broadcasts || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/broadcasts - Delete broadcast notification entry by notification IDs
router.delete('/broadcasts', (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids) {
            return res.status(400).json({ error: 'Notification IDs required' });
        }

        const idList = Array.isArray(ids) ? ids : ids.split(',');
        const placeholders = idList.map(() => '?').join(',');
        
        db.prepare(`DELETE FROM notifications WHERE id IN (${placeholders})`).run(...idList);

        res.json({ success: true, message: 'Broadcast notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/demo-reset-logs - Get log history of demo database resets
router.get('/demo-reset-logs', (req, res) => {
    try {
        const logs = db.prepare('SELECT id, trigger_type, status, details, created_at FROM demo_reset_logs ORDER BY created_at DESC').all();
        res.json(logs || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/reset-demo - Trigger manual demo reset
router.post('/reset-demo', async (req, res) => {
    try {
        await checkAndResetDemoDatabase(true);
        res.json({ success: true, message: 'Demo database reset complete' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
