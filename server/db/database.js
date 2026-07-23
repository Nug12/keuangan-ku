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

// Seed demo user + dummy data
async function seedDemoData() {
    const { v4: uuidv4 } = await import('uuid');

    // Create demo user if not exists
    let user = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@keuanganku.com');
    if (!user) {
        const passwordHash = await hashPassword('demo1234');
        const userId = uuidv4();
        db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)')
            .run(userId, 'demo@keuanganku.com', passwordHash, 'Demo User');
        user = { id: userId };
        console.log('Demo user created');
    }

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

    console.log('Demo data seeded: pockets, transactions, budgets');
}
seedDemoData().catch(console.error);

export default db;
