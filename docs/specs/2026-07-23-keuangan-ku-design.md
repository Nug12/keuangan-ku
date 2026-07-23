# KeuanganKu - Design Specification

## Overview
Aplikasi web pengelolaan keuangan pribadi yang ringan, cepat, responsif, dan mudah digunakan. Fitur utama: multi-kantong (pockets), transfer antar kantong, budgeting, ringkasan keuangan dengan grafik, export PDF/Excel, dan notifikasi in-app.

## Target Users
- Pengguna pribadi (single user)
- Ingin melacak pemasukan dan pengeluaran
- Mengelola budget dalam beberapa kantong

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Vanilla JS + Vite |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Charts | Chart.js |
| Export | jsPDF + SheetJS |
| Container | Docker + Docker Compose |
| Reverse Proxy | Caddy (sudah ada di VPS) |
| Offline | Service Worker + localStorage |

## Features

### 1. Authentication
- Login/Register dengan email & password
- Password di-hash dengan bcrypt (salt rounds: 10)
- JWT token (expiry: 24 jam)
- Auto-logout setelah 30 menit idle
- Token disimpan di localStorage

### 2. Pockets (Kantong)
- Buat/edit/hapus kantong
- Icon & warna custom per kantong
- Reusable envelope (budget bulanan)
- Lihat saldo per kantong

### 3. Transactions
- Tambah pemasukan (income)
- Tambah pengeluaran (expense)
- Transfer antar kantong
- Riwayat transaksi per kantong
- Kategori transaksi

### 4. Budgeting
- Set budget per kantong (weekly/monthly)
- Progress bar penggunaan budget
- Notifikasi saat budget hampir habis (80%)

### 5. Reports & Charts
- Ringkasan harian, mingguan, bulanan
- Pie chart per kategori
- Line chart tren pengeluaran
- Bar chart perbandingan kantong

### 6. Export
- Export PDF (html2pdf.js)
- Export Excel (SheetJS)
- Filter: bulanan, tahunan, custom date range

### 7. Notifications
- In-app notifications
- Budget warning (80% terpakai)
- Recurring transaction reminder

### 8. Offline-First
- Service Worker untuk cache static files
- localStorage untuk pending transactions
- Simple sync (last-write-wins) saat online

## Database Schema

```sql
-- Kantong (Pockets)
CREATE TABLE pockets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '💰',
    balance REAL DEFAULT 0,
    color TEXT DEFAULT '#87CEEB',
    is_recurring BOOLEAN DEFAULT 0,
    budget_limit REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transaksi
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    pocket_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense', 'transfer')),
    amount REAL NOT NULL,
    description TEXT,
    category TEXT,
    target_pocket_id TEXT,
    recurring_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pocket_id) REFERENCES pockets(id),
    FOREIGN KEY (target_pocket_id) REFERENCES pockets(id)
);

-- Budget per Kantong
CREATE TABLE budgets (
    id TEXT PRIMARY KEY,
    pocket_id TEXT NOT NULL,
    amount REAL NOT NULL,
    period TEXT CHECK(period IN ('weekly', 'monthly')),
    spent REAL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (pocket_id) REFERENCES pockets(id)
);

-- Notifikasi
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    type TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Auth
```
POST   /api/auth/register    - Register user baru
POST   /api/auth/login       - Login
GET    /api/auth/me          - Get current user
```

### Pockets
```
GET    /api/pockets           - List semua kantong
GET    /api/pockets/:id       - Detail satu kantong
POST   /api/pockets           - Buat kantong baru
PUT    /api/pockets/:id       - Update kantong
DELETE /api/pockets/:id       - Hapus kantong
```

### Transactions
```
GET    /api/transactions           - List transaksi (filter: pocket_id, type, date range)
GET    /api/transactions/:id       - Detail transaksi
POST   /api/transactions           - Buat transaksi baru
POST   /api/transactions/transfer  - Transfer antar kantong
DELETE /api/transactions/:id       - Hapus transaksi
```

### Budgets
```
GET    /api/budgets                - List semua budget
POST   /api/budgets                - Buat budget baru
PUT    /api/budgets/:id            - Update budget
DELETE /api/budgets/:id            - Hapus budget
```

### Reports
```
GET    /api/reports/summary        - Ringkasan hari ini
GET    /api/reports/weekly         - Ringkasan mingguan
GET    /api/reports/monthly        - Ringkasan bulanan
GET    /api/reports/by-category    - Breakdown per kategori
GET    /api/reports/by-pocket      - Breakdown per kantong
GET    /api/reports/export         - Export data (PDF/Excel)
```

### Notifications
```
GET    /api/notifications          - List notifikasi
PUT    /api/notifications/:id/read - Tandai sudah dibaca
DELETE /api/notifications/:id      - Hapus notifikasi
```

## Project Structure

```
keuangan-ku/
├── client/                        # Frontend (Vite + Vanilla JS)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   └── src/
│       ├── main.js
│       ├── router.js
│       ├── api.js
│       ├── store.js
│       ├── components/
│       │   ├── PocketCard.js
│       │   ├── TransactionForm.js
│       │   ├── TransferForm.js
│       │   ├── BudgetTracker.js
│       │   ├── Charts/
│       │   │   ├── PieChart.js
│       │   │   ├── LineChart.js
│       │   │   └── BarChart.js
│       │   └── NotificationBell.js
│       ├── pages/
│       │   ├── Dashboard.js
│       │   ├── Pockets.js
│       │   ├── Transactions.js
│       │   ├── Budgets.js
│       │   └── Reports.js
│       └── styles/
│           ├── main.css
│           ├── variables.css
│           └── components/
│
├── server/                        # Backend (Node.js + Express)
│   ├── index.js
│   ├── package.json
│   ├── db/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pockets.js
│   │   ├── transactions.js
│   │   ├── budgets.js
│   │   ├── reports.js
│   │   └── notifications.js
│   ├── middleware/
│   │   └── auth.js
│   └── utils/
│       ├── hasher.js
│       └── exporter.js
│
├── landing/                       # Landing Page (static)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── apps.json
│
├── docker-compose.yml
├── Dockerfile
├── .env
├── .gitignore
└── README.md
```

## Color Theme (Sky/Mint)

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
}
```

## Deployment

### Docker Compose
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
      - JWT_SECRET=your_secret_key
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

### Caddy Configuration
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

## Landing Page

### Structure
- Dynamic from `apps.json` (mudah maintenance)
- Responsive (mobile & desktop)
- Grid cards untuk setiap app
- Section "About Me"

### apps.json
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

## Development Phases

| Phase | Fitur | Estimasi |
|-------|-------|----------|
| 1 | Landing page + About me | 1-2 hari |
| 2 | Auth (login/register) | 1 hari |
| 3 | CRUD Pockets | 1-2 hari |
| 4 | Transaksi + Transfer | 2 hari |
| 5 | Budget tracking | 1 hari |
| 6 | Reports + Charts | 2 hari |
| 7 | Export PDF/Excel | 1 hari |
| 8 | Notifications | 1 hari |
| 9 | Offline/Sync | 1-2 hari |
| 10 | Docker + Deploy | 1 hari |
| **Total** | | **~12-15 hari** |
