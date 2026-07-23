import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'keuangan.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
const schema = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');
db.exec(schema);

export default db;
