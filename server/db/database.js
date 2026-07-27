import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { hashPassword } from '../utils/hasher.js';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'keuangan.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
const schema = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Migration: add theme, color_theme, language, role, auth_provider, reset_token columns & notification title if missing
try { db.exec("ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'light'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN color_theme TEXT DEFAULT 'ocean'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'id'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT"); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME"); } catch {}
try { db.exec("ALTER TABLE notifications ADD COLUMN title TEXT"); } catch {}
try { db.exec("CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT)"); } catch {}

try { db.exec("UPDATE users SET email = 'demo@nug12.biz.id' WHERE LOWER(email) = 'demo@keuanganku.com'"); } catch {}

// Guarantee core accounts and roles on server startup
async function syncCoreAccounts() {
    const { v4: uuidv4 } = await import('uuid');

    // 1. Admin account: admin@nug12.biz.id (Role: admin, Pass: adminbizid)
    const adminHash = await hashPassword('adminbizid');
    let admin = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get('admin@nug12.biz.id');
    if (!admin) {
        db.prepare('INSERT INTO users (id, email, password_hash, name, role, theme, language) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(uuidv4(), 'admin@nug12.biz.id', adminHash, 'System Administrator', 'admin', 'light', 'id');
        console.log('✅ Created admin account: admin@nug12.biz.id (role: admin)');
    } else {
        db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?").run(adminHash, admin.id);
        console.log('✅ Synced admin account: admin@nug12.biz.id (role: admin)');
    }

    // 2. Owner account: nug12@nug12.biz.id (Role: user, Pass: nug12bizid)
    const ownerHash = await hashPassword('nug12bizid');
    let owner = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get('nug12@nug12.biz.id');
    if (!owner) {
        db.prepare('INSERT INTO users (id, email, password_hash, name, role, theme, language) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(uuidv4(), 'nug12@nug12.biz.id', ownerHash, 'Nugroho', 'user', 'light', 'id');
        console.log('✅ Created owner account: nug12@nug12.biz.id (role: user)');
    } else {
        db.prepare("UPDATE users SET password_hash = ?, role = 'user' WHERE id = ?").run(ownerHash, owner.id);
        console.log('✅ Synced owner account: nug12@nug12.biz.id (role: user)');
    }

    // 3. Demo account: demo@nug12.biz.id (Role: user, Pass: demo1234)
    const demoHash = await hashPassword('demo1234');
    let demo = db.prepare('SELECT id FROM users WHERE LOWER(email) IN (?, ?)').get('demo@nug12.biz.id', 'demo@keuanganku.com');
    if (!demo) {
        db.prepare('INSERT INTO users (id, email, password_hash, name, role, theme, language) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(uuidv4(), 'demo@nug12.biz.id', demoHash, 'Demo User', 'user', 'light', 'id');
        console.log('✅ Created demo account: demo@nug12.biz.id');
    } else {
        db.prepare("UPDATE users SET email = 'demo@nug12.biz.id', password_hash = ? WHERE id = ?").run(demoHash, demo.id);
    }
}
syncCoreAccounts().catch(console.error);

// Seed demo user dummy data
async function seedDemoData() {
    const { v4: uuidv4 } = await import('uuid');
    let user = db.prepare('SELECT id FROM users WHERE LOWER(email) IN (?, ?)').get('demo@nug12.biz.id', 'demo@keuanganku.com');
    if (!user) return;

    const userId = user.id;

    // Only seed data if no pockets exist
    const existingPockets = db.prepare('SELECT id FROM pockets WHERE user_id = ?').get(userId);
    if (existingPockets) return;

    // Create pockets
    const pockets = [
        { id: uuidv4(), name: 'Dompet Utama', icon: 'fa-solid fa-wallet', color: '#87CEEB', balance: 2500000 },
        { id: uuidv4(), name: 'Tabungan', icon: 'fa-solid fa-piggy-bank', color: '#98FB98', balance: 10000000 },
        { id: uuidv4(), name: 'Darurat', icon: 'fa-solid fa-shield-halved', color: '#FFB6C1', balance: 3000000 },
        { id: uuidv4(), name: 'Jalan-jalan', icon: 'fa-solid fa-plane', color: '#FFD700', balance: 1500000 },
    ];

    const insertPocket = db.prepare('INSERT INTO pockets (id, user_id, name, icon, color, balance) VALUES (?, ?, ?, ?, ?, ?)');
    pockets.forEach(p => insertPocket.run(p.id, userId, p.name, p.icon, p.color, p.balance));

    // Helper to generate dates
    function daysAgo(n) {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d.toISOString();
    }

    // Create transactions
    const transactions = [
        { pocket: 0, type: 'income', amount: 5000000, desc: 'Gaji Bulanan', cat: 'gaji', days: 30 },
        { pocket: 0, type: 'income', amount: 1500000, desc: 'Freelance Project', cat: 'gaji', days: 25 },
        { pocket: 0, type: 'expense', amount: 85000, desc: 'Makan siang kantor', cat: 'makanan', days: 28 },
        { pocket: 0, type: 'expense', amount: 50000, desc: 'Grab ke kantor', cat: 'transport', days: 27 },
        { pocket: 0, type: 'expense', amount: 350000, desc: 'Belanja groceries', cat: 'belanja', days: 26 },
        { pocket: 0, type: 'expense', amount: 120000, desc: 'Makan malam anniversary', cat: 'makanan', days: 25 },
        { pocket: 0, type: 'expense', amount: 250000, desc: 'Tagihan internet', cat: 'tagihan', days: 24 },
        { pocket: 0, type: 'expense', amount: 75000, desc: 'Nonton bioskop', cat: 'hiburan', days: 23 },
        { pocket: 0, type: 'transfer', amount: 1000000, desc: 'Transfer ke Tabungan', days: 22, target: 1 },
        { pocket: 0, type: 'expense', amount: 45000, desc: 'Kopi Starbucks', cat: 'makanan', days: 20 },
        { pocket: 0, type: 'expense', amount: 150000, desc: 'Bensin motor', cat: 'transport', days: 18 },
        { pocket: 0, type: 'income', amount: 500000, desc: 'Bonus project', cat: 'gaji', days: 15 },
        { pocket: 0, type: 'expense', amount: 200000, desc: 'Beli buku', cat: 'belanja', days: 14 },
        { pocket: 0, type: 'expense', amount: 90000, desc: 'Makan bakso', cat: 'makanan', days: 12 },
        { pocket: 0, type: 'expense', amount: 500000, desc: 'Bayar listrik', cat: 'tagihan', days: 10 },
        { pocket: 0, type: 'transfer', amount: 500000, desc: 'Transfer ke Darurat', days: 8, target: 2 },
        { pocket: 0, type: 'expense', amount: 30000, desc: 'Parkir mall', cat: 'transport', days: 7 },
        { pocket: 0, type: 'expense', amount: 180000, desc: 'Makan sushi', cat: 'makanan', days: 5 },
        { pocket: 0, type: 'expense', amount: 250000, desc: 'Game Steam', cat: 'hiburan', days: 4 },
        { pocket: 0, type: 'expense', amount: 70000, desc: 'Snack gorengan', cat: 'makanan', days: 3 },
        { pocket: 0, type: 'income', amount: 200000, desc: 'Jual barang bekas', cat: 'lainnya', days: 2 },
        { pocket: 0, type: 'expense', amount: 400000, desc: 'Belanja fashion', cat: 'belanja', days: 1 },
        { pocket: 0, type: 'expense', amount: 60000, desc: 'Sarapan pagi', cat: 'makanan', days: 0 },
        { pocket: 3, type: 'expense', amount: 350000, desc: 'Tiket kereta', cat: 'transport', days: 15 },
        { pocket: 3, type: 'expense', amount: 500000, desc: 'Penginapan', cat: 'lainnya', days: 15 },
        { pocket: 3, type: 'expense', amount: 200000, desc: 'Cenderamata', cat: 'belanja', days: 14 },
    ];

    const insertTxn = db.prepare('INSERT INTO transactions (id, user_id, pocket_id, type, amount, description, category, target_pocket_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    transactions.forEach(t => {
        const pocketId = pockets[t.pocket].id;
        const targetId = t.target !== undefined ? pockets[t.target].id : null;
        insertTxn.run(uuidv4(), userId, pocketId, t.type, t.amount, t.desc, t.cat || null, targetId, daysAgo(t.days));
    });

    // Create budgets
    const insertBudget = db.prepare('INSERT INTO budgets (id, user_id, pocket_id, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    insertBudget.run(uuidv4(), userId, pockets[0].id, 2000000, 'monthly', monthStart, monthEnd);
    insertBudget.run(uuidv4(), userId, pockets[3].id, 500000, 'monthly', monthStart, monthEnd);

    // Seed data for owner (nug12) too, so the app is viewable after login
    let ownerUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get('nug12@nug12.biz.id');
    if (ownerUser) {
        const ownerId = ownerUser.id;
        let opockets = db.prepare('SELECT id, name FROM pockets WHERE user_id = ?').all(ownerId);
        if (opockets.length === 0) {
            const pocketDefs = [
                { id: uuidv4(), name: 'Dompet Utama', icon: 'fa-solid fa-wallet', color: '#87CEEB', balance: 4250000 },
                { id: uuidv4(), name: 'Tabungan', icon: 'fa-solid fa-vault', color: '#98FB98', balance: 18500000 },
                { id: uuidv4(), name: 'Proyek', icon: 'fa-solid fa-laptop-code', color: '#FFB6C1', balance: 6500000 },
            ];
            const insertPocket = db.prepare('INSERT INTO pockets (id, user_id, name, icon, color, balance) VALUES (?, ?, ?, ?, ?, ?)');
            pocketDefs.forEach(p => insertPocket.run(p.id, ownerId, p.name, p.icon, p.color, p.balance));
            insertBudget.run(uuidv4(), ownerId, pocketDefs[0].id, 3000000, 'monthly', monthStart, monthEnd);
            opockets = db.prepare('SELECT id, name FROM pockets WHERE user_id = ?').all(ownerId);
        }

        // Seed 20 owner transactions if non-existent
        const existingOwnerTxns = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?').get(ownerId);
        if (existingOwnerTxns.count === 0 && opockets.length >= 3) {
            const ownerTxns = [
                { pocket: 0, type: 'income', amount: 12500000, desc: 'Gaji Bulanan PT Tech', cat: 'gaji', days: 30 },
                { pocket: 2, type: 'income', amount: 4500000, desc: 'Payment Project Client A', cat: 'freelance', days: 28 },
                { pocket: 0, type: 'expense', amount: 125000, desc: 'Makan Siang Resto', cat: 'makanan', days: 27 },
                { pocket: 0, type: 'expense', amount: 75000, desc: 'GrabCar Meeting Client', cat: 'transport', days: 26 },
                { pocket: 0, type: 'expense', amount: 450000, desc: 'Supermarket Groceries', cat: 'belanja', days: 25 },
                { pocket: 0, type: 'transfer', amount: 3000000, desc: 'Transfer ke Tabungan', days: 24, target: 1 },
                { pocket: 0, type: 'expense', amount: 350000, desc: 'Tagihan Indihome & PLN', cat: 'tagihan', days: 22 },
                { pocket: 0, type: 'expense', amount: 150000, desc: 'Nonton IMAX Cinema', cat: 'hiburan', days: 20 },
                { pocket: 2, type: 'income', amount: 3200000, desc: 'DP Project Mobile App', cat: 'freelance', days: 18 },
                { pocket: 0, type: 'expense', amount: 65000, desc: 'Kopi Kencana', cat: 'makanan', days: 17 },
                { pocket: 0, type: 'expense', amount: 200000, desc: 'Isi Bensin Pertamax', cat: 'transport', days: 15 },
                { pocket: 0, type: 'expense', amount: 850000, desc: 'Belanja Pakaian Kerja', cat: 'belanja', days: 14 },
                { pocket: 2, type: 'transfer', amount: 2000000, desc: 'Simpan Hasil Proyek', days: 12, target: 1 },
                { pocket: 0, type: 'expense', amount: 220000, desc: 'Dinner Bareng Tim', cat: 'makanan', days: 10 },
                { pocket: 2, type: 'expense', amount: 180000, desc: 'Subscription SaaS Tool', cat: 'tagihan', days: 8 },
                { pocket: 0, type: 'income', amount: 1500000, desc: 'Dividen Saham', cat: 'lainnya', days: 6 },
                { pocket: 0, type: 'expense', amount: 110000, desc: 'GrabFood Malam', cat: 'makanan', days: 4 },
                { pocket: 0, type: 'expense', amount: 300000, desc: 'Membership Gym', cat: 'hiburan', days: 3 },
                { pocket: 0, type: 'expense', amount: 45000, desc: 'Parkir & E-Toll', cat: 'transport', days: 2 },
                { pocket: 0, type: 'expense', amount: 550000, desc: 'Belanja Mingguan', cat: 'belanja', days: 1 }
            ];

            const insertTxn = db.prepare('INSERT INTO transactions (id, user_id, pocket_id, type, amount, description, category, target_pocket_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            ownerTxns.forEach(t => {
                const pocketId = opockets[t.pocket].id;
                const targetId = t.target !== undefined ? opockets[t.target].id : null;
                insertTxn.run(uuidv4(), ownerId, pocketId, t.type, t.amount, t.desc, t.cat || null, targetId, daysAgo(t.days));
            });
            console.log('20 owner transactions seeded for nug12@nug12.biz.id');
        }
    }

    console.log('Demo data seeded: pockets, transactions, budgets');
}

// Table for system metadata & demo reset logs
try {
    db.exec(`CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS demo_reset_logs (
        id TEXT PRIMARY KEY,
        trigger_type TEXT DEFAULT 'auto',
        status TEXT DEFAULT 'success',
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
} catch (e) {}

export async function checkAndResetDemoDatabase(force = false) {
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const lastResetRow = db.prepare("SELECT value FROM app_metadata WHERE key = 'last_demo_reset'").get();
    const now = Date.now();

    let lastReset = lastResetRow ? parseInt(lastResetRow.value, 10) : 0;
    if (force || !lastResetRow || (now - lastReset >= TWO_DAYS_MS)) {
        console.log('🔄 Executing 2-day demo database reset back to current seed state...');
        
        try {
            let demoUser = db.prepare('SELECT id FROM users WHERE LOWER(email) IN (?, ?)').get('demo@nug12.biz.id', 'demo@keuanganku.com');
            if (demoUser) {
                const uid = demoUser.id;
                db.prepare('DELETE FROM transactions WHERE user_id = ?').run(uid);
                db.prepare('DELETE FROM budgets WHERE user_id = ?').run(uid);
                db.prepare('DELETE FROM pockets WHERE user_id = ?').run(uid);
                db.prepare('DELETE FROM notifications WHERE user_id = ?').run(uid);
            }
            
            await seedDemoData();
            db.prepare("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_demo_reset', ?)").run(now.toString());
            
            // Log successful reset
            const { v4: uuidv4 } = await import('uuid');
            db.prepare('INSERT INTO demo_reset_logs (id, trigger_type, status, details, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
                .run(uuidv4(), force ? 'manual' : 'auto', 'success', force ? 'Manual reset executed by Admin' : 'Automatic 2-day scheduled database reset');
            
            console.log('✓ Demo database successfully reset to clean 2-day snapshot.');
        } catch (err) {
            console.error('Error during demo database reset:', err);
            try {
                const { v4: uuidv4 } = await import('uuid');
                db.prepare('INSERT INTO demo_reset_logs (id, trigger_type, status, details, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
                    .run(uuidv4(), force ? 'manual' : 'auto', 'failed', `Reset failed: ${err.message}`);
            } catch (logErr) {}
        }
    }
}

// Run reset check on boot & periodically every 30 minutes
checkAndResetDemoDatabase();
setInterval(() => {
    try {
        checkAndResetDemoDatabase();
    } catch (e) {
        console.error('Error in periodic demo reset check:', e);
    }
}, 30 * 60 * 1000);

export default db;
