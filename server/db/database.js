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

// Seed demo user if not exists
async function seedDemoUser() {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@keuanganku.com');
    if (!existing) {
        const { v4: uuidv4 } = await import('uuid');
        const id = uuidv4();
        const passwordHash = await hashPassword('demo1234');
        db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)')
            .run(id, 'demo@keuanganku.com', passwordHash, 'Demo User');
        console.log('Demo user seeded: demo@keuanganku.com / demo1234');
    }
}
seedDemoUser().catch(console.error);

export default db;
