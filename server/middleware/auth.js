import jwt from 'jsonwebtoken';
import db from '../db/database.js';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

export function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const userEmail = (req.user.email || '').toLowerCase().trim();
    if (userEmail === 'admin@nug12.biz.id') {
        return next();
    }
    
    try {
        const user = db.prepare('SELECT role, email FROM users WHERE id = ?').get(req.user.id);
        if (user && (user.role === 'admin' || user.email.toLowerCase() === 'admin@nug12.biz.id')) {
            return next();
        }
    } catch (e) {}

    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
}
