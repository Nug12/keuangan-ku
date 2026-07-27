import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { hashPassword, comparePassword } from '../utils/hasher.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const id = uuidv4();
        const passwordHash = await hashPassword(password);

        db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)')
            .run(id, email, passwordHash, name);

        const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ token, user: { id, email, name } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const cleanEmail = (email || '').trim().toLowerCase();
        const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { credential, email, name } = req.body;
        
        let userEmail = email;
        let userName = name;

        // If JWT credential from Google Identity Services is provided, attempt to decode it
        if (credential && !userEmail) {
            try {
                const decoded = jwt.decode(credential);
                if (decoded && decoded.email) {
                    userEmail = decoded.email;
                    userName = decoded.name || decoded.given_name || userName;
                }
            } catch (e) {
                console.error('Error decoding Google JWT credential:', e);
            }
        }

        if (!userEmail) {
            return res.status(400).json({ error: 'Email Google required' });
        }

        const cleanEmail = userEmail.trim().toLowerCase();
        let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

        if (!user) {
            // New user logging in with Google -> automatically set role as 'user'
            const id = uuidv4();
            const dummyHash = await hashPassword(uuidv4());
            userName = userName || cleanEmail.split('@')[0];

            db.prepare(`
                INSERT INTO users (id, email, password_hash, name, role, auth_provider, theme, language)
                VALUES (?, ?, ?, ?, 'user', 'google', 'light', 'id')
            `).run(id, cleanEmail, dummyHash, userName);

            // Create a default primary pocket for the new Google user
            try {
                db.prepare(`
                    INSERT INTO pockets (id, user_id, name, icon, color, balance)
                    VALUES (?, ?, 'Dompet Utama', 'fa-solid fa-wallet', '#87CEEB', 1000000)
                `).run(uuidv4(), id);
            } catch (pErr) {
                console.error('Error creating default pocket for Google user:', pErr);
            }

            user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
            console.log(`✅ New user registered via Google: ${cleanEmail} (role: user)`);
        } else {
            // Update auth_provider to google if not set
            if (user.auth_provider !== 'google') {
                db.prepare("UPDATE users SET auth_provider = 'google' WHERE id = ?").run(user.id);
                user.auth_provider = 'google';
            }
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                auth_provider: user.auth_provider || 'google'
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Google login server error' });
    }
});

// Forgot Password Request (Generate 6-digit Reset Code)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail === 'demo@nug12.biz.id' || cleanEmail === 'demo@keuanganku.com') {
            return res.status(403).json({ error: 'Fasilitas lupa password dikunci untuk akun demo.' });
        }

        const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
        if (!user) {
            return res.status(404).json({ error: 'Email pengguna tidak ditemukan' });
        }

        // Generate 6-digit code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
            .run(resetToken, expiresAt, user.id);

        console.log(`📧 [EMAIL SIMULATION] Sent password reset code to ${cleanEmail}: ${resetToken}`);

        res.json({
            success: true,
            message: 'Kode reset password 6-digit telah berhasil dikirim ke email Anda.',
            email: cleanEmail,
            resetToken // Included for testing ease
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ error: 'Server error saat memproses lupa password' });
    }
});

// Reset Password Execution
router.post('/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: 'Email, kode reset, dan password baru wajib diisi' });
        }

        if (newPassword.trim().length < 4) {
            return res.status(400).json({ error: 'Password baru minimal 4 karakter' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? AND reset_token = ?').get(cleanEmail, token.trim());

        if (!user) {
            return res.status(400).json({ error: 'Kode reset password tidak valid atau salah' });
        }

        // Check expiration
        if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ error: 'Kode reset password sudah kadaluarsa (berlaku 1 jam)' });
        }

        const newHash = await hashPassword(newPassword);
        db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
            .run(newHash, user.id);

        console.log(`✅ Password reset successfully for user: ${cleanEmail}`);

        res.json({
            success: true,
            message: 'Password berhasil diperbarui! Silakan masuk kembali dengan password baru.'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'Server error saat me-reset password' });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, email, name, role, auth_provider, theme, color_theme, language FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// Update preferences (theme, colorTheme, language, name)
router.put('/preferences', authenticateToken, (req, res) => {
    const { theme, colorTheme, language, name } = req.body;
    const updates = [];
    const params = [];
    
    if (name !== undefined && name.trim()) { 
        updates.push('name = ?'); 
        params.push(name.trim()); 
    }
    if (theme !== undefined) { 
        updates.push('theme = ?'); 
        params.push(theme); 
    }
    if (colorTheme !== undefined) {
        updates.push('color_theme = ?');
        params.push(colorTheme);
    }
    if (language !== undefined) { 
        updates.push('language = ?'); 
        params.push(language); 
    }
    
    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    
    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    const user = db.prepare('SELECT id, email, name, role, auth_provider, theme, color_theme, language FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
});

// Change password (blocked for demo account only)
router.put('/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    // Block password change hanya untuk akun demo
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.id);
    const userEmail = (user.email || '').toLowerCase();
    if (userEmail.includes('demo') || userEmail === 'demo@nug12.biz.id' || userEmail === 'demo@keuanganku.com') {
        return res.status(403).json({ 
            error: 'Perubahan password untuk akun demo dikunci.' 
        });
    }
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new password required' });
    }
    
    const userData = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const valid = await comparePassword(oldPassword, userData.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Current password incorrect' });
    }
    
    const newHash = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
    
    res.json({ message: 'Password changed successfully' });
});

export default router;
