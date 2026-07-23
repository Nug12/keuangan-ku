# KeuanganKu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use galyarder-framework:subagent-driven-development (recommended) or galyarder-framework:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web pengelolaan keuangan pribadi dengan fitur multi-kantong, budgeting, dan export PDF/Excel

**Architecture:** Frontend Vanilla JS + Vite, Backend Node.js + Express, Database SQLite, Deploy via Docker di VPS dengan Caddy reverse proxy

**Tech Stack:** Vanilla JS, Vite, Node.js, Express, SQLite, JWT, bcrypt, Chart.js, jsPDF, SheetJS, Docker

---

## Phase 1: Project Setup & Landing Page (1-2 hari)

### Task 1.1: Initialize Project Structure

**Files:**
- Create: `keuangan-ku/`
- Create: `keuangan-ku/client/package.json`
- Create: `keuangan-ku/server/package.json`
- Create: `keuangan-ku/.gitignore`
- Create: `keuangan-ku/.env`

- [ ] **Step 1: Create project directories**

```bash
mkdir -p keuangan-ku/{client/src/{components,pages,styles},server/{db,routes,middleware,utils},landing}
```

- [ ] **Step 2: Initialize client package.json**

```json
{
  "name": "keuangan-ku-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: Initialize server package.json**

```json
{
  "name": "keuangan-ku-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js",
    "start": "node index.js"
  }
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
data/*.db
.env
```

- [ ] **Step 5: Create .env**

```
JWT_SECRET=your-super-secret-key-change-this
PORT=3000
NODE_ENV=development
```

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: initialize project structure"
```

---

### Task 1.2: Build Landing Page

**Files:**
- Create: `keuangan-ku/landing/index.html`
- Create: `keuangan-ku/landing/style.css`
- Create: `keuangan-ku/landing/script.js`
- Create: `keuangan-ku/landing/apps.json`

- [ ] **Step 1: Create apps.json**

```json
{
  "apps": [
    {
      "id": "keuangan-ku",
      "name": "KeuanganKu",
      "icon": "💰",
      "description": "Kelola keuangan pribadi dengan mudah",
      "url": "/app",
      "color": "#87CEEB",
      "status": "live"
    }
  ]
}
```

- [ ] **Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Apps</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar">
        <div class="logo">💼 My Apps</div>
    </nav>

    <main class="container">
        <section class="hero">
            <h1>Selamat Datang! 👋</h1>
            <p>Kumpulan aplikasi yang saya buat. Klik untuk mencoba.</p>
        </section>

        <section class="apps-grid" id="appsGrid">
            <!-- Apps loaded dynamically -->
        </section>

        <section class="about" id="about">
            <h2>About Me</h2>
            <p>Developer yang suka membuat aplikasi bermanfaat.</p>
        </section>
    </main>

    <footer class="footer">
        <p>Made with ❤️</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create style.css**

```css
:root {
    --primary: #87CEEB;
    --primary-light: #B0E0E6;
    --secondary: #98FB98;
    --background: #FFFAF0;
    --text: #2F4F4F;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.6;
}

.navbar {
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    padding: 4rem 0;
}

.hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
.hero p { font-size: 1.2rem; color: #666; }

.apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
}

.app-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    text-decoration: none;
    color: inherit;
}

.app-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.app-card .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.app-card h3 { font-size: 1.3rem; margin-bottom: 0.5rem; }
.app-card p { color: #666; font-size: 0.9rem; }

.app-card .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    margin-top: 1rem;
    background: #90EE90;
    color: #2F4F4F;
}

.about {
    text-align: center;
    padding: 4rem 0;
    margin-top: 2rem;
    border-top: 1px solid #eee;
}

.footer {
    text-align: center;
    padding: 2rem;
    background: white;
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .hero h1 { font-size: 1.8rem; }
    .container { padding: 1rem; }
}
```

- [ ] **Step 4: Create script.js**

```javascript
async function loadApps() {
    const response = await fetch('apps.json');
    const data = await response.json();
    const grid = document.getElementById('appsGrid');

    data.apps.forEach(app => {
        const card = document.createElement('a');
        card.href = app.url;
        card.className = 'app-card';
        card.innerHTML = `
            <div class="icon">${app.icon}</div>
            <h3>${app.name}</h3>
            <p>${app.description}</p>
            <span class="status">${app.status}</span>
        `;
        grid.appendChild(card);
    });
}

loadApps();
```

- [ ] **Step 5: Test locally**

```bash
cd keuangan-ku/landing
python3 -m http.server 8080
# Buka http://localhost:8080
```

- [ ] **Step 6: Commit**

```bash
git add landing/
git commit -m "feat: add landing page with dynamic apps grid"
```

---

## Phase 2: Backend Setup & Auth (1-2 hari)

### Task 2.1: Setup Express Server

**Files:**
- Create: `keuangan-ku/server/index.js`
- Create: `keuangan-ku/server/db/database.js`
- Create: `keuangan-ku/server/db/schema.sql`

- [ ] **Step 1: Install dependencies**

```bash
cd keuangan-ku/server
npm install express better-sqlite3 bcryptjs jsonwebtoken cors dotenv uuid
npm install -D nodemon
```

- [ ] **Step 2: Create schema.sql**

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pockets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '💰',
    balance REAL DEFAULT 0,
    color TEXT DEFAULT '#87CEEB',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pocket_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense', 'transfer')),
    amount REAL NOT NULL,
    description TEXT,
    category TEXT,
    target_pocket_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pocket_id) REFERENCES pockets(id),
    FOREIGN KEY (target_pocket_id) REFERENCES pockets(id)
);

CREATE TABLE budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pocket_id TEXT NOT NULL,
    amount REAL NOT NULL,
    period TEXT CHECK(period IN ('weekly', 'monthly')),
    spent REAL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pocket_id) REFERENCES pockets(id)
);

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

- [ ] **Step 3: Create database.js**

```javascript
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'data', 'keuangan.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
const schema = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');
db.exec(schema);

export default db;
```

- [ ] **Step 4: Create index.js**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mkdirSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Ensure data directory exists
mkdirSync(join(process.cwd(), 'data'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 5: Test server**

```bash
cd keuangan-ku/server
npm run dev
# Test: curl http://localhost:3000/api/health
```

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: setup Express server with SQLite database"
```

---

### Task 2.2: Implement Auth Routes

**Files:**
- Create: `keuangan-ku/server/routes/auth.js`
- Create: `keuangan-ku/server/middleware/auth.js`
- Create: `keuangan-ku/server/utils/hasher.js`

- [ ] **Step 1: Create hasher.js**

```javascript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
```

- [ ] **Step 2: Create auth middleware**

```javascript
import jwt from 'jsonwebtoken';

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
```

- [ ] **Step 3: Create auth routes**

```javascript
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

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

export default router;
```

- [ ] **Step 4: Update index.js to use auth routes**

```javascript
import authRoutes from './routes/auth.js';

// ... existing code ...
app.use('/api/auth', authRoutes);
```

- [ ] **Step 5: Test auth**

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: implement auth routes with JWT"
```

---

## Phase 3: Frontend Core (2-3 hari)

### Task 3.1: Setup Vite & Frontend Structure

**Files:**
- Create: `keuangan-ku/client/vite.config.js`
- Create: `keuangan-ku/client/index.html`
- Create: `keuangan-ku/client/src/main.js`
- Create: `keuangan-ku/client/src/api.js`
- Create: `keuangan-ku/client/src/store.js`
- Create: `keuangan-ku/client/src/router.js`
- Create: `keuangan-ku/client/src/styles/variables.css`
- Create: `keuangan-ku/client/src/styles/main.css`

- [ ] **Step 1: Install client dependencies**

```bash
cd keuangan-ku/client
npm install
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:3000'
        }
    }
});
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeuanganKu</title>
    <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create variables.css**

```css
:root {
    --primary: #87CEEB;
    --primary-light: #B0E0E6;
    --secondary: #98FB98;
    --secondary-light: #F0FFF0;
    --accent: #FFB6C1;
    --background: #FFFAF0;
    --text: #2F4F4F;
    --text-light: #708090;
    --success: #90EE90;
    --warning: #FFD700;
    --danger: #FFB6C1;
    --white: #FFFFFF;
    --shadow: 0 4px 15px rgba(0,0,0,0.1);
    --radius: 16px;
}
```

- [ ] **Step 5: Create main.css**

```css
@import './variables.css';

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--background);
    color: var(--text);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s;
}

.btn-primary {
    background: var(--primary);
    color: var(--text);
}

.btn-primary:hover {
    background: var(--primary-light);
}

.card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
}

input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
}

@media (max-width: 768px) {
    .container { padding: 1rem; }
}
```

- [ ] **Step 6: Create api.js**

```javascript
const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearToken();
        window.location.hash = '#/login';
        throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

export const api = {
    // Auth
    login: (email, password) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),
    register: (email, password, name) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    }),
    getMe: () => request('/auth/me'),

    // Pockets
    getPockets: () => request('/pockets'),
    createPocket: (data) => request('/pockets', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updatePocket: (id, data) => request(`/pockets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deletePocket: (id) => request(`/pockets/${id}`, {
        method: 'DELETE',
    }),

    // Transactions
    getTransactions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/transactions?${query}`);
    },
    createTransaction: (data) => request('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    transfer: (data) => request('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteTransaction: (id) => request(`/transactions/${id}`, {
        method: 'DELETE',
    }),

    // Budgets
    getBudgets: () => request('/budgets'),
    createBudget: (data) => request('/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateBudget: (id, data) => request(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteBudget: (id) => request(`/budgets/${id}`, {
        method: 'DELETE',
    }),

    // Reports
    getSummary: () => request('/reports/summary'),
    getWeekly: () => request('/reports/weekly'),
    getMonthly: () => request('/reports/monthly'),
    getByCategory: () => request('/reports/by-category'),
    getByPocket: () => request('/reports/by-pocket'),

    // Notifications
    getNotifications: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
};
```

- [ ] **Step 7: Create store.js**

```javascript
export const store = {
    user: null,
    pockets: [],
    transactions: [],
    budgets: [],
    notifications: [],

    setUser(user) { this.user = user; },
    setPockets(pockets) { this.pockets = pockets; },
    setTransactions(transactions) { this.transactions = transactions; },
    setBudgets(budgets) { this.budgets = budgets; },
    setNotifications(notifications) { this.notifications = notifications; },
};
```

- [ ] **Step 8: Create router.js**

```javascript
const routes = {};
let currentRoute = null;

export function route(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = `#${path}`;
}

function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const handler = routes[hash];

    if (handler) {
        currentRoute = hash;
        handler();
    } else {
        navigate('/');
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
```

- [ ] **Step 9: Create main.js**

```javascript
import { api } from './api.js';
import { store } from './store.js';
import { route, initRouter, navigate } from './router.js';

// Pages
import { renderLogin } from './pages/Login.js';
import { renderRegister } from './pages/Register.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderPockets } from './pages/Pockets.js';
import { renderTransactions } from './pages/Transactions.js';
import { renderBudgets } from './pages/Budgets.js';
import { renderReports } from './pages/Reports.js';

// Check auth
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Auth guard
function requireAuth(handler) {
    return async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        await handler();
    };
}

// Routes
route('/login', renderLogin);
route('/register', renderRegister);
route('/app', requireAuth(renderDashboard));
route('/app/pockets', requireAuth(renderPockets));
route('/app/transactions', requireAuth(renderTransactions));
route('/app/budgets', requireAuth(renderBudgets));
route('/app/reports', requireAuth(renderReports));

// Init
initRouter();
```

- [ ] **Step 10: Commit**

```bash
git add client/
git commit -m "feat: setup Vite frontend with router, store, and API client"
```

---

## Phase 4: Pockets CRUD (1-2 hari)

### Task 4.1: Backend Pockets Routes

**Files:**
- Create: `keuangan-ku/server/routes/pockets.js`

- [ ] **Step 1: Create pockets routes**

```javascript
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
```

- [ ] **Step 2: Update index.js**

```javascript
import pocketRoutes from './routes/pockets.js';
app.use('/api/pockets', pocketRoutes);
```

- [ ] **Step 3: Test pockets**

```bash
# Create pocket
curl -X POST http://localhost:3000/api/pockets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Makan","icon":"🍜","color":"#FFE4B5"}'

# List pockets
curl http://localhost:3000/api/pockets \
  -H "Authorization: Bearer <token>"
```

- [ ] **Step 4: Commit**

```bash
git add server/
git commit -m "feat: implement pockets CRUD routes"
```

---

### Task 4.2: Frontend Pockets Page

**Files:**
- Create: `keuangan-ku/client/src/pages/Pockets.js`
- Create: `keuangan-ku/client/src/components/PocketCard.js`

- [ ] **Step 1: Create PocketCard component**

```javascript
export function PocketCard(pocket, onEdit, onDelete) {
    const card = document.createElement('div');
    card.className = 'card pocket-card';
    card.style.borderLeft = `4px solid ${pocket.color}`;

    card.innerHTML = `
        <div class="pocket-header">
            <span class="pocket-icon">${pocket.icon}</span>
            <div class="pocket-actions">
                <button class="btn-icon edit-btn">✏️</button>
                <button class="btn-icon delete-btn">🗑️</button>
            </div>
        </div>
        <h3>${pocket.name}</h3>
        <p class="pocket-balance">Rp ${pocket.balance.toLocaleString('id-ID')}</p>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => onEdit(pocket));
    card.querySelector('.delete-btn').addEventListener('click', () => onDelete(pocket.id));

    return card;
}
```

- [ ] **Step 2: Create Pockets page**

```javascript
import { api } from '../api.js';
import { store } from '../store.js';
import { PocketCard } from '../components/PocketCard.js';

export async function renderPockets() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>💰 Kantong Saya</h1>
                <button class="btn btn-primary" id="addPocket">+ Tambah Kantong</button>
            </div>
            <div class="pockets-grid" id="pocketsGrid"></div>
        </div>

        <!-- Modal -->
        <div class="modal" id="modal" style="display:none">
            <div class="modal-content">
                <h2 id="modalTitle">Tambah Kantong</h2>
                <form id="pocketForm">
                    <input type="hidden" id="pocketId">
                    <label>Nama Kantong</label>
                    <input type="text" id="pocketName" required>
                    <label>Icon</label>
                    <input type="text" id="pocketIcon" value="💰">
                    <label>Warna</label>
                    <input type="color" id="pocketColor" value="#87CEEB">
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancelBtn">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Load pockets
    await loadPockets();

    // Event listeners
    document.getElementById('addPocket').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('pocketForm').addEventListener('submit', handleSubmit);
}

async function loadPockets() {
    const pockets = await api.getPockets();
    store.setPockets(pockets);
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('pocketsGrid');
    grid.innerHTML = '';

    store.pockets.forEach(pocket => {
        const card = PocketCard(pocket, openEditModal, handleDelete);
        grid.appendChild(card);
    });
}

function openModal() {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Tambah Kantong';
    document.getElementById('pocketForm').reset();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function openEditModal(pocket) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Edit Kantong';
    document.getElementById('pocketId').value = pocket.id;
    document.getElementById('pocketName').value = pocket.name;
    document.getElementById('pocketIcon').value = pocket.icon;
    document.getElementById('pocketColor').value = pocket.color;
}

async function handleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('pocketId').value;
    const data = {
        name: document.getElementById('pocketName').value,
        icon: document.getElementById('pocketIcon').value,
        color: document.getElementById('pocketColor').value,
    };

    if (id) {
        await api.updatePocket(id, data);
    } else {
        await api.createPocket(data);
    }

    closeModal();
    await loadPockets();
}

async function handleDelete(id) {
    if (confirm('Yakin ingin menghapus kantong ini?')) {
        await api.deletePocket(id);
        await loadPockets();
    }
}
```

- [ ] **Step 3: Add CSS for pockets page**

```css
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.pockets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.pocket-card {
    transition: transform 0.3s;
}

.pocket-card:hover {
    transform: translateY(-3px);
}

.pocket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.pocket-icon {
    font-size: 2rem;
}

.pocket-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
}

.pocket-balance {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
    margin-top: 0.5rem;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: var(--radius);
    width: 90%;
    max-width: 400px;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
}
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: implement pockets page with CRUD UI"
```

---

## Phase 5: Transactions & Transfer (2 hari)

### Task 5.1: Backend Transactions Routes

**Files:**
- Create: `keuangan-ku/server/routes/transactions.js`

- [ ] **Step 1: Create transactions routes**

```javascript
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// List transactions
router.get('/', (req, res) => {
    const { pocket_id, type, start_date, end_date } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (pocket_id) {
        query += ' AND (pocket_id = ? OR target_pocket_id = ?)';
        params.push(pocket_id, pocket_id);
    }

    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

    if (start_date) {
        query += ' AND created_at >= ?';
        params.push(start_date);
    }

    if (end_date) {
        query += ' AND created_at <= ?';
        params.push(end_date);
    }

    query += ' ORDER BY created_at DESC';

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
});

// Create transaction (income/expense)
router.post('/', (req, res) => {
    const { pocket_id, type, amount, description, category } = req.body;

    if (!pocket_id || !type || !amount) {
        return res.status(400).json({ error: 'pocket_id, type, and amount are required' });
    }

    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'type must be income or expense' });
    }

    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(pocket_id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    const id = uuidv4();

    // Insert transaction
    db.prepare('INSERT INTO transactions (id, user_id, pocket_id, type, amount, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, req.user.id, pocket_id, type, amount, description, category);

    // Update pocket balance
    const newBalance = type === 'income' ? pocket.balance + amount : pocket.balance - amount;
    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?').run(newBalance, pocket_id);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json(transaction);
});

// Transfer between pockets
router.post('/transfer', (req, res) => {
    const { from_pocket_id, to_pocket_id, amount, description } = req.body;

    if (!from_pocket_id || !to_pocket_id || !amount) {
        return res.status(400).json({ error: 'from_pocket_id, to_pocket_id, and amount are required' });
    }

    if (from_pocket_id === to_pocket_id) {
        return res.status(400).json({ error: 'Cannot transfer to same pocket' });
    }

    const fromPocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(from_pocket_id, req.user.id);

    const toPocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(to_pocket_id, req.user.id);

    if (!fromPocket || !toPocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    if (fromPocket.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    const id = uuidv4();

    // Insert transfer transaction
    db.prepare('INSERT INTO transactions (id, user_id, pocket_id, type, amount, description, target_pocket_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, req.user.id, from_pocket_id, 'transfer', amount, description, to_pocket_id);

    // Update balances
    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?')
        .run(fromPocket.balance - amount, from_pocket_id);
    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?')
        .run(toPocket.balance + amount, to_pocket_id);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json(transaction);
});

// Delete transaction
router.delete('/:id', (req, res) => {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);

    // Reverse balance change
    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ?').get(transaction.pocket_id);
    if (pocket) {
        let newBalance = pocket.balance;
        if (transaction.type === 'income') {
            newBalance -= transaction.amount;
        } else if (transaction.type === 'expense') {
            newBalance += transaction.amount;
        } else if (transaction.type === 'transfer') {
            newBalance += transaction.amount;
            // Reverse target pocket
            if (transaction.target_pocket_id) {
                const targetPocket = db.prepare('SELECT * FROM pockets WHERE id = ?')
                    .get(transaction.target_pocket_id);
                if (targetPocket) {
                    db.prepare('UPDATE pockets SET balance = ? WHERE id = ?')
                        .run(targetPocket.balance - transaction.amount, transaction.target_pocket_id);
                }
            }
        }
        db.prepare('UPDATE pockets SET balance = ? WHERE id = ?').run(newBalance, transaction.pocket_id);
    }

    res.json({ message: 'Transaction deleted' });
});

export default router;
```

- [ ] **Step 2: Update index.js**

```javascript
import transactionRoutes from './routes/transactions.js';
app.use('/api/transactions', transactionRoutes);
```

- [ ] **Step 3: Test transactions**

```bash
# Create income
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"pocket_id":"xxx","type":"income","amount":500000,"description":"Gaji"}'

# Transfer
curl -X POST http://localhost:3000/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"from_pocket_id":"xxx","to_pocket_id":"yyy","amount":100000,"description":"Transfer"}'
```

- [ ] **Step 4: Commit**

```bash
git add server/
git commit -m "feat: implement transactions and transfer routes"
```

---

### Task 5.2: Frontend Transactions Page

**Files:**
- Create: `keuangan-ku/client/src/pages/Transactions.js`
- Create: `keuangan-ku/client/src/components/TransactionForm.js`
- Create: `keuangan-ku/client/src/components/TransferForm.js`

- [ ] **Step 1: Create TransactionForm component**

```javascript
export function TransactionForm(pockets, onSubmit) {
    const form = document.createElement('form');
    form.className = 'transaction-form';

    form.innerHTML = `
        <h3>Tambah Transaksi</h3>
        <div class="form-tabs">
            <button type="button" class="tab active" data-type="expense">Pengeluaran</button>
            <button type="button" class="tab" data-type="income">Pemasukan</button>
        </div>
        <input type="hidden" id="txnType" value="expense">
        <label>Kantong</label>
        <select id="txnPocket" required>
            ${pockets.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
        </select>
        <label>Nominal</label>
        <input type="number" id="txnAmount" required min="1">
        <label>Kategori</label>
        <select id="txnCategory">
            <option value="makanan">🍜 Makanan</option>
            <option value="transport">🚗 Transport</option>
            <option value="belanja">🛒 Belanja</option>
            <option value="tagihan">📄 Tagihan</option>
            <option value="hiburan">🎮 Hiburan</option>
            <option value="lainnya">📦 Lainnya</option>
        </select>
        <label>Deskripsi</label>
        <input type="text" id="txnDescription" placeholder="Opsional">
        <button type="submit" class="btn btn-primary btn-block">Simpan</button>
    `;

    // Tab switching
    form.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            form.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('txnType').value = tab.dataset.type;
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        onSubmit({
            pocket_id: document.getElementById('txnPocket').value,
            type: document.getElementById('txnType').value,
            amount: parseFloat(document.getElementById('txnAmount').value),
            category: document.getElementById('txnCategory').value,
            description: document.getElementById('txnDescription').value,
        });
    });

    return form;
}
```

- [ ] **Step 2: Create TransferForm component**

```javascript
export function TransferForm(pockets, onSubmit) {
    const form = document.createElement('form');
    form.className = 'transfer-form';

    form.innerHTML = `
        <h3>Transfer Antar Kantong</h3>
        <label>Dari Kantong</label>
        <select id="fromPocket" required>
            ${pockets.map(p => `<option value="${p.id}">${p.icon} ${p.name} (Rp ${p.balance.toLocaleString('id-ID')})</option>`).join('')}
        </select>
        <label>Ke Kantong</label>
        <select id="toPocket" required>
            ${pockets.map(p => `<option value="${p.id}">${p.icon} ${p.name} (Rp ${p.balance.toLocaleString('id-ID')})</option>`).join('')}
        </select>
        <label>Nominal</label>
        <input type="number" id="transferAmount" required min="1">
        <label>Catatan</label>
        <input type="text" id="transferNote" placeholder="Opsional">
        <button type="submit" class="btn btn-primary btn-block">Transfer</button>
    `;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        onSubmit({
            from_pocket_id: document.getElementById('fromPocket').value,
            to_pocket_id: document.getElementById('toPocket').value,
            amount: parseFloat(document.getElementById('transferAmount').value),
            description: document.getElementById('transferNote').value,
        });
    });

    return form;
}
```

- [ ] **Step 3: Create Transactions page**

```javascript
import { api } from '../api.js';
import { store } from '../store.js';
import { TransactionForm } from '../components/TransactionForm.js';
import { TransferForm } from '../components/TransferForm.js';

export async function renderTransactions() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>💳 Transaksi</h1>
            </div>

            <div class="transaction-layout">
                <div class="transaction-forms">
                    <div class="card" id="formCard"></div>
                </div>
                <div class="transaction-list">
                    <h2>Riwayat Transaksi</h2>
                    <div id="transactionList"></div>
                </div>
            </div>
        </div>
    `;

    // Load data
    await loadPockets();
    await loadTransactions();

    // Show transaction form by default
    showTransactionForm();
}

async function loadPockets() {
    const pockets = await api.getPockets();
    store.setPockets(pockets);
}

async function loadTransactions() {
    const transactions = await api.getTransactions();
    store.setTransactions(transactions);
    renderTransactionList();
}

function showTransactionForm() {
    const formCard = document.getElementById('formCard');
    formCard.innerHTML = '';

    const tabs = document.createElement('div');
    tabs.className = 'form-tabs';
    tabs.innerHTML = `
        <button class="tab active" data-form="transaction">Transaksi</button>
        <button class="tab" data-form="transfer">Transfer</button>
    `;

    const formContainer = document.createElement('div');
    formContainer.id = 'formContainer';

    tabs.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.form === 'transaction') {
                formContainer.innerHTML = '';
                formContainer.appendChild(TransactionForm(store.pockets, handleTransaction));
            } else {
                formContainer.innerHTML = '';
                formContainer.appendChild(TransferForm(store.pockets, handleTransfer));
            }
        });
    });

    formCard.appendChild(tabs);
    formCard.appendChild(formContainer);

    // Show transaction form by default
    formContainer.appendChild(TransactionForm(store.pockets, handleTransaction));
}

function renderTransactionList() {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';

    store.transactions.forEach(txn => {
        const item = document.createElement('div');
        item.className = 'transaction-item';

        const isIncome = txn.type === 'income';
        const isTransfer = txn.type === 'transfer';
        const icon = isIncome ? '📈' : isTransfer ? '🔄' : '📉';
        const color = isIncome ? 'var(--success)' : isTransfer ? 'var(--primary)' : 'var(--danger)';
        const sign = isIncome ? '+' : '-';

        item.innerHTML = `
            <div class="txn-icon">${icon}</div>
            <div class="txn-info">
                <p class="txn-desc">${txn.description || txn.category || txn.type}</p>
                <p class="txn-date">${new Date(txn.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div class="txn-amount" style="color:${color}">${sign} Rp ${txn.amount.toLocaleString('id-ID')}</div>
        `;

        list.appendChild(item);
    });
}

async function handleTransaction(data) {
    await api.createTransaction(data);
    await loadTransactions();
    showTransactionForm();
}

async function handleTransfer(data) {
    await api.transfer(data);
    await loadTransactions();
    showTransactionForm();
}
```

- [ ] **Step 4: Add CSS for transactions**

```css
.transaction-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.form-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.form-tabs .tab {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s;
}

.form-tabs .tab.active {
    background: var(--primary);
    color: var(--text);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.btn-block {
    width: 100%;
}

.transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.transaction-item:last-child {
    border-bottom: none;
}

.txn-icon {
    font-size: 1.5rem;
}

.txn-info {
    flex: 1;
}

.txn-desc {
    font-weight: 500;
}

.txn-date {
    font-size: 0.85rem;
    color: var(--text-light);
}

.txn-amount {
    font-weight: bold;
    font-size: 1.1rem;
}

@media (max-width: 768px) {
    .transaction-layout {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add client/
git commit -m "feat: implement transactions page with form and transfer"
```

---

## Phase 6: Budgeting (1 hari)

### Task 6.1: Backend Budgets Routes

**Files:**
- Create: `keuangan-ku/server/routes/budgets.js`

- [ ] **Step 1: Create budgets routes**

```javascript
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// List budgets
router.get('/', (req, res) => {
    const budgets = db.prepare(`
        SELECT b.*, p.name as pocket_name, p.icon as pocket_icon, p.color as pocket_color
        FROM budgets b
        JOIN pockets p ON b.pocket_id = p.id
        WHERE b.user_id = ?
    `).all(req.user.id);

    // Calculate spent amount for each budget
    const budgetsWithSpent = budgets.map(budget => {
        const start = budget.start_date || new Date().toISOString().split('T')[0];
        const end = budget.end_date || new Date().toISOString().split('T')[0];

        const spent = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE pocket_id = ? AND type = 'expense' AND created_at >= ? AND created_at <= ?
        `).get(budget.pocket_id, start, end);

        return { ...budget, spent: spent.total };
    });

    res.json(budgetsWithSpent);
});

// Create budget
router.post('/', (req, res) => {
    const { pocket_id, amount, period, start_date, end_date } = req.body;

    if (!pocket_id || !amount || !period) {
        return res.status(400).json({ error: 'pocket_id, amount, and period are required' });
    }

    const pocket = db.prepare('SELECT * FROM pockets WHERE id = ? AND user_id = ?')
        .get(pocket_id, req.user.id);

    if (!pocket) {
        return res.status(404).json({ error: 'Pocket not found' });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO budgets (id, user_id, pocket_id, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, req.user.id, pocket_id, amount, period, start_date, end_date);

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.status(201).json(budget);
});

// Update budget
router.put('/:id', (req, res) => {
    const { amount, period, start_date, end_date } = req.body;

    const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('UPDATE budgets SET amount = ?, period = ?, start_date = ?, end_date = ? WHERE id = ?')
        .run(amount || budget.amount, period || budget.period, start_date || budget.start_date, end_date || budget.end_date, req.params.id);

    const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// Delete budget
router.delete('/:id', (req, res) => {
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);

    if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
    }

    db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
    res.json({ message: 'Budget deleted' });
});

export default router;
```

- [ ] **Step 2: Update index.js**

```javascript
import budgetRoutes from './routes/budgets.js';
app.use('/api/budgets', budgetRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add server/
git commit -m "feat: implement budgets routes"
```

---

### Task 6.2: Frontend Budgets Page

**Files:**
- Create: `keuangan-ku/client/src/pages/Budgets.js`
- Create: `keuangan-ku/client/src/components/BudgetTracker.js`

- [ ] **Step 1: Create BudgetTracker component**

```javascript
export function BudgetTracker(budget, onDelete) {
    const card = document.createElement('div');
    card.className = 'card budget-card';

    const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
    const isWarning = percentage >= 80;
    const isDanger = percentage >= 100;

    card.innerHTML = `
        <div class="budget-header">
            <div class="budget-pocket">
                <span class="pocket-icon">${budget.pocket_icon}</span>
                <span>${budget.pocket_name}</span>
            </div>
            <button class="btn-icon delete-btn">🗑️</button>
        </div>
        <div class="budget-progress">
            <div class="progress-bar ${isDanger ? 'danger' : isWarning ? 'warning' : ''}" style="width: ${percentage}%"></div>
        </div>
        <div class="budget-info">
            <span>Rp ${budget.spent.toLocaleString('id-ID')} / Rp ${budget.amount.toLocaleString('id-ID')}</span>
            <span>${percentage.toFixed(0)}%</span>
        </div>
        <p class="budget-period">${budget.period === 'monthly' ? 'Bulanan' : 'Mingguan'}</p>
    `;

    card.querySelector('.delete-btn').addEventListener('click', () => onDelete(budget.id));

    return card;
}
```

- [ ] **Step 2: Create Budgets page**

```javascript
import { api } from '../api.js';
import { store } from '../store.js';
import { BudgetTracker } from '../components/BudgetTracker.js';

export async function renderBudgets() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>📊 Budget</h1>
                <button class="btn btn-primary" id="addBudget">+ Tambah Budget</button>
            </div>
            <div class="budgets-grid" id="budgetsGrid"></div>
        </div>

        <!-- Modal -->
        <div class="modal" id="modal" style="display:none">
            <div class="modal-content">
                <h2>Tambah Budget</h2>
                <form id="budgetForm">
                    <label>Kantong</label>
                    <select id="budgetPocket" required></select>
                    <label>Nominal Budget</label>
                    <input type="number" id="budgetAmount" required min="1">
                    <label>Periode</label>
                    <select id="budgetPeriod" required>
                        <option value="monthly">Bulanan</option>
                        <option value="weekly">Mingguan</option>
                    </select>
                    <label>Tanggal Mulai</label>
                    <input type="date" id="budgetStartDate">
                    <label>Tanggal Selesai</label>
                    <input type="date" id="budgetEndDate">
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancelBtn">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Load data
    await loadPockets();
    await loadBudgets();

    // Event listeners
    document.getElementById('addBudget').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('budgetForm').addEventListener('submit', handleSubmit);
}

async function loadPockets() {
    const pockets = await api.getPockets();
    store.setPockets(pockets);

    // Populate pocket select
    const select = document.getElementById('budgetPocket');
    select.innerHTML = store.pockets.map(p =>
        `<option value="${p.id}">${p.icon} ${p.name}</option>`
    ).join('');
}

async function loadBudgets() {
    const budgets = await api.getBudgets();
    store.setBudgets(budgets);
    renderBudgetsGrid();
}

function renderBudgetsGrid() {
    const grid = document.getElementById('budgetsGrid');
    grid.innerHTML = '';

    store.budgets.forEach(budget => {
        const card = BudgetTracker(budget, handleDelete);
        grid.appendChild(card);
    });
}

function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function handleSubmit(e) {
    e.preventDefault();

    const data = {
        pocket_id: document.getElementById('budgetPocket').value,
        amount: parseFloat(document.getElementById('budgetAmount').value),
        period: document.getElementById('budgetPeriod').value,
        start_date: document.getElementById('budgetStartDate').value || null,
        end_date: document.getElementById('budgetEndDate').value || null,
    };

    await api.createBudget(data);
    closeModal();
    await loadBudgets();
}

async function handleDelete(id) {
    if (confirm('Yakin ingin menghapus budget ini?')) {
        await api.deleteBudget(id);
        await loadBudgets();
    }
}
```

- [ ] **Step 3: Add CSS for budgets**

```css
.budgets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.budget-card {
    padding: 1.5rem;
}

.budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.budget-pocket {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
}

.budget-progress {
    height: 12px;
    background: #f0f0f0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-bar {
    height: 100%;
    background: var(--success);
    border-radius: 6px;
    transition: width 0.3s;
}

.progress-bar.warning {
    background: var(--warning);
}

.progress-bar.danger {
    background: var(--danger);
}

.budget-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--text-light);
}

.budget-period {
    font-size: 0.85rem;
    color: var(--text-light);
    margin-top: 0.5rem;
}
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: implement budgets page with tracker"
```

---

## Phase 7: Reports & Charts (2 hari)

### Task 7.1: Backend Reports Routes

**Files:**
- Create: `keuangan-ku/server/routes/reports.js`

- [ ] **Step 1: Create reports routes**

```javascript
import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Daily summary
router.get('/summary', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const income = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ? AND type = 'income' AND DATE(created_at) = ?
    `).get(req.user.id, today);

    const expense = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND DATE(created_at) = ?
    `).get(req.user.id, today);

    const totalBalance = db.prepare(`
        SELECT COALESCE(SUM(balance), 0) as total
        FROM pockets
        WHERE user_id = ?
    `).get(req.user.id);

    res.json({
        date: today,
        income: income.total,
        expense: expense.total,
        net: income.total - expense.total,
        totalBalance: totalBalance.total,
    });
});

// Weekly summary
router.get('/weekly', (req, res) => {
    const weeks = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weeks.push(date.toISOString().split('T')[0]);
    }

    const data = weeks.map(date => {
        const income = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'income' AND DATE(created_at) = ?
        `).get(req.user.id, date);

        const expense = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'expense' AND DATE(created_at) = ?
        `).get(req.user.id, date);

        return {
            date,
            income: income.total,
            expense: expense.total,
        };
    });

    res.json(data);
});

// Monthly summary
router.get('/monthly', (req, res) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
        });
    }

    const data = months.map(({ year, month }) => {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const income = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'income' AND DATE(created_at) >= ? AND DATE(created_at) <= ?
        `).get(req.user.id, startDate, endDate);

        const expense = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE user_id = ? AND type = 'expense' AND DATE(created_at) >= ? AND DATE(created_at) <= ?
        `).get(req.user.id, startDate, endDate);

        return {
            month: `${year}-${String(month).padStart(2, '0')}`,
            income: income.total,
            expense: expense.total,
        };
    });

    res.json(data);
});

// By category
router.get('/by-category', (req, res) => {
    const data = db.prepare(`
        SELECT category, SUM(amount) as total
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND category IS NOT NULL
        GROUP BY category
        ORDER BY total DESC
    `).all(req.user.id);

    res.json(data);
});

// By pocket
router.get('/by-pocket', (req, res) => {
    const data = db.prepare(`
        SELECT p.name, p.icon, p.color, COALESCE(SUM(t.amount), 0) as total
        FROM pockets p
        LEFT JOIN transactions t ON p.id = t.pocket_id AND t.type = 'expense'
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY total DESC
    `).all(req.user.id);

    res.json(data);
});

// Export data
router.get('/export', (req, res) => {
    const { start_date, end_date, format } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (start_date) {
        query += ' AND created_at >= ?';
        params.push(start_date);
    }

    if (end_date) {
        query += ' AND created_at <= ?';
        params.push(end_date);
    }

    query += ' ORDER BY created_at DESC';

    const transactions = db.prepare(query).all(...params);

    res.json(transactions);
});

export default router;
```

- [ ] **Step 2: Update index.js**

```javascript
import reportRoutes from './routes/reports.js';
app.use('/api/reports', reportRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add server/
git commit -m "feat: implement reports routes"
```

---

### Task 7.2: Frontend Reports Page

**Files:**
- Create: `keuangan-ku/client/src/pages/Reports.js`
- Create: `keuangan-ku/client/src/components/Charts/PieChart.js`
- Create: `keuangan-ku/client/src/components/Charts/LineChart.js`
- Create: `keuangan-ku/client/src/components/Charts/BarChart.js`

- [ ] **Step 1: Install Chart.js**

```bash
cd keuangan-ku/client
npm install chart.js
```

- [ ] **Step 2: Create PieChart component**

```javascript
import Chart from 'chart.js/auto';

export function PieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const colors = [
        '#87CEEB', '#98FB98', '#FFB6C1', '#FFD700',
        '#90EE90', '#B0E0E6', '#DDA0DD', '#F0E68C'
    ];

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.category || d.name),
            datasets: [{
                data: data.map(d => d.total),
                backgroundColor: colors.slice(0, data.length),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}
```

- [ ] **Step 3: Create LineChart component**

```javascript
import Chart from 'chart.js/auto';

export function LineChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date || d.month),
            datasets: [
                {
                    label: 'Pemasukan',
                    data: data.map(d => d.income),
                    borderColor: '#90EE90',
                    backgroundColor: 'rgba(144, 238, 144, 0.2)',
                    fill: true,
                },
                {
                    label: 'Pengeluaran',
                    data: data.map(d => d.expense),
                    borderColor: '#FFB6C1',
                    backgroundColor: 'rgba(255, 182, 193, 0.2)',
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}
```

- [ ] **Step 4: Create BarChart component**

```javascript
import Chart from 'chart.js/auto';

export function BarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => `${d.icon} ${d.name}`),
            datasets: [{
                label: 'Pengeluaran',
                data: data.map(d => d.total),
                backgroundColor: data.map(d => d.color || '#87CEEB'),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}
```

- [ ] **Step 5: Create Reports page**

```javascript
import { api } from '../api.js';
import { PieChart } from '../components/Charts/PieChart.js';
import { LineChart } from '../components/Charts/LineChart.js';
import { BarChart } from '../components/Charts/BarChart.js';

let charts = [];

export async function renderReports() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <div class="page-header">
                <h1>📈 Laporan</h1>
                <div class="export-buttons">
                    <button class="btn btn-secondary" id="exportPDF">📄 Export PDF</button>
                    <button class="btn btn-secondary" id="exportExcel">📊 Export Excel</button>
                </div>
            </div>

            <div class="summary-cards" id="summaryCards"></div>

            <div class="charts-grid">
                <div class="card">
                    <h3>Tren Pengeluaran</h3>
                    <div class="chart-container">
                        <canvas id="lineChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Pengeluaran per Kategori</h3>
                    <div class="chart-container">
                        <canvas id="pieChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Pengeluaran per Kantong</h3>
                    <div class="chart-container">
                        <canvas id="barChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Export Modal -->
            <div class="modal" id="exportModal" style="display:none">
                <div class="modal-content">
                    <h2>Export Laporan</h2>
                    <form id="exportForm">
                        <label>Periode</label>
                        <select id="exportPeriod">
                            <option value="monthly">Bulanan</option>
                            <option value="yearly">Tahunan</option>
                            <option value="custom">Custom</option>
                        </select>
                        <div id="customDates" style="display:none">
                            <label>Dari Tanggal</label>
                            <input type="date" id="startDate">
                            <label>Sampai Tanggal</label>
                            <input type="date" id="endDate">
                        </div>
                        <label>Format</label>
                        <select id="exportFormat">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancelExport">Batal</button>
                            <button type="submit" class="btn btn-primary">Download</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Load data
    await loadReports();

    // Event listeners
    document.getElementById('exportPDF').addEventListener('click', () => openExportModal('pdf'));
    document.getElementById('exportExcel').addEventListener('click', () => openExportModal('excel'));
    document.getElementById('cancelExport').addEventListener('click', closeExportModal);
    document.getElementById('exportForm').addEventListener('submit', handleExport);

    document.getElementById('exportPeriod').addEventListener('change', (e) => {
        document.getElementById('customDates').style.display =
            e.target.value === 'custom' ? 'block' : 'none';
    });
}

async function loadReports() {
    // Destroy existing charts
    charts.forEach(chart => chart.destroy());
    charts = [];

    const [summary, weekly, byCategory, byPocket] = await Promise.all([
        api.getSummary(),
        api.getWeekly(),
        api.getByCategory(),
        api.getByPocket(),
    ]);

    // Render summary cards
    const summaryCards = document.getElementById('summaryCards');
    summaryCards.innerHTML = `
        <div class="card summary-card">
            <p class="summary-label">Total Saldo</p>
            <p class="summary-value">Rp ${summary.totalBalance.toLocaleString('id-ID')}</p>
        </div>
        <div class="card summary-card income">
            <p class="summary-label">Pemasukan Hari Ini</p>
            <p class="summary-value">+ Rp ${summary.income.toLocaleString('id-ID')}</p>
        </div>
        <div class="card summary-card expense">
            <p class="summary-label">Pengeluaran Hari Ini</p>
            <p class="summary-value">- Rp ${summary.expense.toLocaleString('id-ID')}</p>
        </div>
    `;

    // Render charts
    if (byCategory.length > 0) {
        charts.push(PieChart('pieChart', byCategory));
    }

    charts.push(LineChart('lineChart', weekly));

    if (byPocket.length > 0) {
        charts.push(BarChart('barChart', byPocket));
    }
}

function openExportModal(format) {
    document.getElementById('exportModal').style.display = 'flex';
    document.getElementById('exportFormat').value = format;
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

async function handleExport(e) {
    e.preventDefault();

    const period = document.getElementById('exportPeriod').value;
    const format = document.getElementById('exportFormat').value;

    let startDate, endDate;

    if (period === 'monthly') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (period === 'yearly') {
        const now = new Date();
        startDate = `${now.getFullYear()}-01-01`;
        endDate = `${now.getFullYear()}-12-31`;
    } else {
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;
    }

    const data = await api.getExport({ start_date: startDate, end_date: endDate });

    if (format === 'pdf') {
        exportPDF(data, startDate, endDate);
    } else {
        exportExcel(data, startDate, endDate);
    }

    closeExportModal();
}

function exportPDF(data, startDate, endDate) {
    // Will be implemented in Phase 8
    console.log('PDF export:', data);
    alert('PDF export akan diimplementasikan di Phase 8');
}

function exportExcel(data, startDate, endDate) {
    // Will be implemented in Phase 8
    console.log('Excel export:', data);
    alert('Excel export akan diimplementasikan di Phase 8');
}
```

- [ ] **Step 6: Add CSS for reports**

```css
.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.summary-card {
    text-align: center;
    padding: 1.5rem;
}

.summary-card.income .summary-value {
    color: var(--success);
}

.summary-card.expense .summary-value {
    color: var(--danger);
}

.summary-label {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
}

.summary-value {
    font-size: 1.5rem;
    font-weight: bold;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
}

.chart-container {
    position: relative;
    height: 300px;
}

.export-buttons {
    display: flex;
    gap: 0.5rem;
}
```

- [ ] **Step 7: Commit**

```bash
git add client/
git commit -m "feat: implement reports page with charts"
```

---

## Phase 8: Export PDF/Excel (1 hari)

### Task 8.1: Frontend Export Functionality

**Files:**
- Modify: `keuangan-ku/client/src/pages/Reports.js`
- Install: `jsPDF`, `xlsx`

- [ ] **Step 1: Install dependencies**

```bash
cd keuangan-ku/client
npm install jspdf xlsx
```

- [ ] **Step 2: Update export functions in Reports.js**

```javascript
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

function exportPDF(data, startDate, endDate) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Laporan Keuangan', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Periode: ${startDate} - ${endDate}`, 105, 30, { align: 'center' });

    // Table header
    let y = 50;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Tanggal', 20, y);
    doc.text('Tipe', 60, y);
    doc.text('Kategori', 90, y);
    doc.text('Deskripsi', 120, y);
    doc.text('Jumlah', 160, y);

    // Table data
    doc.setFont(undefined, 'normal');
    y += 10;

    data.forEach(txn => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(new Date(txn.created_at).toLocaleDateString('id-ID'), 20, y);
        doc.text(txn.type, 60, y);
        doc.text(txn.category || '-', 90, y);
        doc.text(txn.description || '-', 120, y);
        doc.text(`Rp ${txn.amount.toLocaleString('id-ID')}`, 160, y);

        y += 8;
    });

    // Summary
    y += 10;
    doc.setFont(undefined, 'bold');
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    doc.text('Total Pemasukan:', 20, y);
    doc.text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 160, y);
    y += 8;
    doc.text('Total Pengeluaran:', 20, y);
    doc.text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 160, y);

    doc.save(`laporan-keuangan-${startDate}-${endDate}.pdf`);
}

function exportExcel(data, startDate, endDate) {
    const worksheetData = data.map(txn => ({
        'Tanggal': new Date(txn.created_at).toLocaleDateString('id-ID'),
        'Tipe': txn.type,
        'Kategori': txn.category || '-',
        'Deskripsi': txn.description || '-',
        'Jumlah': txn.amount,
    }));

    // Add summary
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    worksheetData.push({});
    worksheetData.push({ 'Tanggal': 'Total Pemasukan', 'Jumlah': totalIncome });
    worksheetData.push({ 'Tanggal': 'Total Pengeluaran', 'Jumlah': totalExpense });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

    XLSX.writeFile(workbook, `laporan-keuangan-${startDate}-${endDate}.xlsx`);
}
```

- [ ] **Step 3: Test export**

```bash
cd keuangan-ku/client
npm run dev
# Test export PDF and Excel from reports page
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: implement PDF and Excel export"
```

---

## Phase 9: Notifications (1 hari)

### Task 9.1: Backend Notifications Routes

**Files:**
- Create: `keuangan-ku/server/routes/notifications.js`

- [ ] **Step 1: Create notifications routes**

```javascript
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
```

- [ ] **Step 2: Update index.js**

```javascript
import notificationRoutes from './routes/notifications.js';
app.use('/api/notifications', notificationRoutes);
```

- [ ] **Step 3: Add budget warning check**

```javascript
// In transactions routes, after creating expense
import { createNotification } from './routes/notifications.js';

// Check budget warning
const budget = db.prepare('SELECT * FROM budgets WHERE pocket_id = ? AND user_id = ?')
    .get(pocket_id, req.user.id);

if (budget) {
    const spent = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE pocket_id = ? AND type = 'expense' AND created_at >= ? AND created_at <= ?
    `).get(pocket_id, budget.start_date, budget.end_date);

    const percentage = (spent.total / budget.amount) * 100;
    if (percentage >= 80) {
        createNotification(req.user.id, 'budget_warning',
            `Budget untuk kantong "${pocket.name}" sudah ${percentage.toFixed(0)}% terpakai!`);
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add server/
git commit -m "feat: implement notifications routes with budget warning"
```

---

### Task 9.2: Frontend Notification Bell

**Files:**
- Create: `keuangan-ku/client/src/components/NotificationBell.js`

- [ ] **Step 1: Create NotificationBell component**

```javascript
import { api } from '../api.js';

let notifications = [];

export function NotificationBell() {
    const container = document.createElement('div');
    container.className = 'notification-bell';

    container.innerHTML = `
        <button class="bell-btn" id="bellBtn">
            🔔
            <span class="badge" id="notifBadge" style="display:none">0</span>
        </button>
        <div class="notif-dropdown" id="notifDropdown" style="display:none">
            <div class="notif-header">
                <h4>Notifikasi</h4>
                <button class="btn-link" id="clearAll">Hapus Semua</button>
            </div>
            <div class="notif-list" id="notifList"></div>
        </div>
    `;

    // Event listeners
    container.querySelector('#bellBtn').addEventListener('click', toggleDropdown);
    container.querySelector('#clearAll').addEventListener('click', clearAll);

    // Load notifications
    loadNotifications();

    return container;
}

async function loadNotifications() {
    notifications = await api.getNotifications();
    updateBadge();
    renderList();
}

function updateBadge() {
    const badge = document.getElementById('notifBadge');
    const unread = notifications.filter(n => !n.is_read).length;

    if (unread > 0) {
        badge.style.display = 'block';
        badge.textContent = unread;
    } else {
        badge.style.display = 'none';
    }
}

function renderList() {
    const list = document.getElementById('notifList');
    if (!list) return;

    list.innerHTML = '';

    if (notifications.length === 0) {
        list.innerHTML = '<p class="notif-empty">Tidak ada notifikasi</p>';
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notif-item ${notif.is_read ? '' : 'unread'}`;

        item.innerHTML = `
            <p class="notif-message">${notif.message}</p>
            <p class="notif-time">${new Date(notif.created_at).toLocaleString('id-ID')}</p>
        `;

        item.addEventListener('click', async () => {
            if (!notif.is_read) {
                await api.markRead(notif.id);
                notif.is_read = 1;
                updateBadge();
                item.classList.remove('unread');
            }
        });

        list.appendChild(item);
    });
}

function toggleDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

async function clearAll() {
    for (const notif of notifications) {
        await api.deleteNotification(notif.id);
    }
    notifications = [];
    updateBadge();
    renderList();
}
```

- [ ] **Step 2: Add to layout**

```javascript
// In main.js or layout component
import { NotificationBell } from './components/NotificationBell.js';

// Add to navbar
const navbar = document.querySelector('.navbar');
navbar.appendChild(NotificationBell());
```

- [ ] **Step 3: Add CSS for notifications**

```css
.notification-bell {
    position: relative;
}

.bell-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    position: relative;
}

.badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--danger);
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
}

.notif-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 320px;
    max-height: 400px;
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
    z-index: 1000;
}

.notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.notif-list {
    max-height: 300px;
    overflow-y: auto;
}

.notif-item {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.2s;
}

.notif-item:hover {
    background: #f9f9f9;
}

.notif-item.unread {
    background: var(--primary-light);
}

.notif-message {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.notif-time {
    font-size: 0.75rem;
    color: var(--text-light);
}

.notif-empty {
    padding: 2rem;
    text-align: center;
    color: var(--text-light);
}

.btn-link {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    font-size: 0.85rem;
}
```

- [ ] **Step 4: Commit**

```bash
git add client/
git commit -m "feat: implement notification bell component"
```

---

## Phase 10: Offline/Sync (1-2 hari)

### Task 10.1: Service Worker & Offline Support

**Files:**
- Create: `keuangan-ku/client/public/sw.js`
- Create: `keuangan-ku/client/public/manifest.json`
- Modify: `keuangan-ku/client/src/main.js`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "KeuanganKu",
  "short_name": "KeuanganKu",
  "start_url": "/app",
  "display": "standalone",
  "background_color": "#FFFAF0",
  "theme_color": "#87CEEB",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Create service worker**

```javascript
const CACHE_NAME = 'keuangan-ku-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/styles/main.css',
    '/src/styles/variables.css',
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip API requests
    if (request.url.includes('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(JSON.stringify({ error: 'Offline' }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 503,
                });
            })
        );
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request);
        })
    );
});
```

- [ ] **Step 3: Register service worker in main.js**

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}
```

- [ ] **Step 4: Add offline indicator**

```javascript
// Add to main.js
function updateOnlineStatus() {
    const indicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
        indicator.style.display = 'none';
    } else {
        indicator.style.display = 'block';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Add to HTML
// <div id="offlineIndicator" style="display:none" class="offline-banner">Anda sedang offline</div>
```

- [ ] **Step 5: Add CSS for offline banner**

```css
.offline-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--warning);
    color: var(--text);
    text-align: center;
    padding: 0.5rem;
    z-index: 9999;
}
```

- [ ] **Step 6: Commit**

```bash
git add client/
git commit -m "feat: implement service worker and offline support"
```

---

## Phase 11: Docker & Deploy (1 hari)

### Task 11.1: Docker Setup

**Files:**
- Create: `keuangan-ku/Dockerfile`
- Create: `keuangan-ku/docker-compose.yml`
- Create: `keuangan-ku/.dockerignore`

- [ ] **Step 1: Create Dockerfile**

```dockerfile
# Stage 1: Build frontend
FROM node:18-alpine AS builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
COPY --from=builder /app/client/dist ./public
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "index.js"]
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: keuangan-ku
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

- [ ] **Step 3: Create .dockerignore**

```
node_modules
npm-debug.log
.git
.gitignore
.env
data/*.db
```

- [ ] **Step 4: Create .env.production**

```
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

- [ ] **Step 5: Build and test**

```bash
cd keuangan-ku
docker compose build
docker compose up -d
docker compose logs -f
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add Docker configuration"
```

---

### Task 11.2: Deploy to VPS

**Files:**
- Modify: Caddy configuration on VPS

- [ ] **Step 1: SSH to VPS**

```bash
ssh root@129.226.152.163
```

- [ ] **Step 2: Clone repository**

```bash
cd /opt
git clone <repository-url> keuangan-ku
cd keuangan-ku
```

- [ ] **Step 3: Setup environment**

```bash
cp .env.example .env
nano .env  # Set JWT_SECRET
```

- [ ] **Step 4: Build and run**

```bash
docker compose build
docker compose up -d
```

- [ ] **Step 5: Configure Caddy**

```bash
nano /etc/caddy/Caddyfile
```

Add:

```
:80 {
    handle / {
        root * /var/www/html
        file_server
    }

    handle /app/* {
        reverse_proxy localhost:3000
    }
}
```

- [ ] **Step 6: Reload Caddy**

```bash
systemctl reload caddy
```

- [ ] **Step 7: Test**

```bash
curl http://129.226.152.163/
curl http://129.226.152.163/app
```

---

## Summary

| Phase | Task | Status |
|-------|------|--------|
| 1 | Project Setup | ⬜ |
| 1 | Landing Page | ⬜ |
| 2 | Express Server | ⬜ |
| 2 | Auth Routes | ⬜ |
| 3 | Frontend Core | ⬜ |
| 4 | Pockets Routes | ⬜ |
| 4 | Pockets Page | ⬜ |
| 5 | Transactions Routes | ⬜ |
| 5 | Transactions Page | ⬜ |
| 6 | Budgets Routes | ⬜ |
| 6 | Budgets Page | ⬜ |
| 7 | Reports Routes | ⬜ |
| 7 | Reports Page | ⬜ |
| 8 | Export PDF/Excel | ⬜ |
| 9 | Notifications Routes | ⬜ |
| 9 | Notification Bell | ⬜ |
| 10 | Service Worker | ⬜ |
| 11 | Docker Setup | ⬜ |
| 11 | Deploy to VPS | ⬜ |
