# Product Requirements Document (PRD)
## KeuanganKu - Aplikasi Pengelolaan Keuangan Pribadi

---

## 1. Overview

**Nama Produk:** KeuanganKu

**Deskripsi:** Aplikasi web pengelolaan keuangan pribadi yang ringan, cepat, responsif, dan mudah digunakan. Pengguna bisa membuat beberapa kantong (pockets), memindahkan uang antar kantong, mengatur budget, melihat ringkasan keuangan dengan grafik, export PDF/Excel, dan mendapat notifikasi in-app.

**Target Users:** Pengguna pribadi yang ingin melacak dan mengelola keuangan harian.

**Platform:** Web (responsive, mobile-first)

**URL Akses:** `http://129.226.152.163/app`

---

## 2. Goals & Objectives

| Goal | Metric | Target |
|------|--------|--------|
| Ringan & Cepat | Page load time | < 2 detik |
| Mudah Digunakan | User bisa tambah transaksi | < 30 detik |
| Offline-First | Bisa akses tanpa internet | Ya |
| Aman | Password ter-hash | bcrypt |
| Responsive | Akses dari mobile | 100% fitur |

---

## 3. User Stories

### Authentication
- Sebagai user, saya ingin bisa register dengan email & password
- Sebagai user, saya ingin bisa login untuk mengakses data saya
- Sebagai user, saya ingin otomatis logout setelah 30 menit idle

### Pockets (Kantong)
- Sebagai user, saya ingin membuat beberapa kantong (contoh: Makan, Transport, Tabungan)
- Sebagai user, saya ingin melihat saldo setiap kantong
- Sebagai user, saya ingin edit nama, icon, dan warna kantong
- Sebagai user, saya ingin menghapus kantong

### Transactions
- Sebagai user, saya ingin mencatat pemasukan (income)
- Sebagai user, saya ingin mencatat pengeluaran (expense)
- Sebagai user, saya ingin transfer uang antar kantong
- Sebagai user, saya ingin melihat riwayat transaksi per kantong

### Budgeting
- Sebagai user, saya ingin mengatur budget per kantong (bulanan/mingguan)
- Sebagai user, saya ingin melihat progress bar penggunaan budget
- Sebagai user, saya ingin notifikasi saat budget hampir habis (80%)

### Reports & Charts
- Sebagai user, saya ingin melihat ringkasan harian
- Sebagai user, saya ingin melihat ringkasan mingguan & bulanan
- Sebagai user, saya ingin melihat pie chart per kategori
- Sebagai user, saya ingin melihat line chart tren pengeluaran

### Export
- Sebagai user, saya ingin export laporan ke PDF
- Sebagai user, saya ingin export laporan ke Excel
- Sebagai user, saya ingin filter export per bulan, tahun, atau custom date range

### Notifications
- Sebagai user, saya ingin melihat notifikasi in-app
- Sebagai user, saya ingin notifikasi saat budget hampir habis

### Landing Page
- Sebagai visitor, saya ingin melihat daftar aplikasi yang tersedia
- Sebagai visitor, saya ingin klik untuk menuju aplikasi

---

## 4. Features

### 4.1 Authentication (Priority: P0)
| Fitur | Deskripsi |
|-------|-----------|
| Register | Email, password, nama |
| Login | Email & password |
| JWT Token | Expiry 24 jam |
| Auto-logout | 30 menit idle |
| Password Hash | bcrypt, salt rounds 10 |

### 4.2 Pockets (Priority: P0)
| Fitur | Deskripsi |
|-------|-----------|
| Create Pocket | Nama, icon, warna |
| List Pockets | Grid cards dengan saldo |
| Edit Pocket | Ubah nama/icon/warna |
| Delete Pocket | Hapus kantong |

### 4.3 Transactions (Priority: P0)
| Fitur | Deskripsi |
|-------|-----------|
| Add Income | Pilih kantong, nominal, deskripsi, kategori |
| Add Expense | Pilih kantong, nominal, deskripsi, kategori |
| Transfer | Dari kantong A ke kantong B |
| History | Daftar transaksi per kantong |

### 4.4 Budgeting (Priority: P1)
| Fitur | Deskripsi |
|-------|-----------|
| Set Budget | Per kantong, nominal, periode (weekly/monthly) |
| Progress Bar | Visualisasi penggunaan budget |
| Budget Warning | Notifikasi saat 80% terpakai |

### 4.5 Reports & Charts (Priority: P1)
| Fitur | Deskripsi |
|-------|-----------|
| Daily Summary | Pemasukan vs Pengeluaran hari ini |
| Weekly Summary | Tren mingguan |
| Monthly Summary | Tren bulanan |
| Pie Chart | Breakdown per kategori |
| Line Chart | Tren pengeluaran |
| Bar Chart | Perbandingan kantong |

### 4.6 Export (Priority: P1)
| Fitur | Deskripsi |
|-------|-----------|
| Export PDF | Format laporan PDF |
| Export Excel | Format spreadsheet |
| Filter | Bulanan, tahunan, custom date range |

### 4.7 Notifications (Priority: P2)
| Fitur | Deskripsi |
|-------|-----------|
| In-app Bell | Icon notifikasi di header |
| Budget Warning | Saat budget 80% terpakai |
| Mark Read | Tandai sudah dibaca |

### 4.8 Landing Page (Priority: P0)
| Fitur | Deskripsi |
|-------|-----------|
| Apps Grid | Daftar aplikasi dari apps.json |
| About Me | Section profil singkat |
| Dynamic | Load dari JSON, mudah maintenance |

### 4.9 Offline Support (Priority: P2)
| Fitur | Deskripsi |
|-------|-----------|
| Service Worker | Cache static files |
| Pending Sync | Simpan transaksi saat offline |
| Auto Sync | Sinkronisasi saat online |

---

## 5. UI/UX Design

### Color Theme (Sky/Mint)
```css
--primary: #87CEEB        /* Sky Blue */
--primary-light: #B0E0E6
--secondary: #98FB98      /* Mint Green */
--secondary-light: #F0FFF0
--accent: #FFB6C1         /* Light Pink */
--background: #FFFAF0     /* Floral White */
--text: #2F4F4F           /* Dark Slate Gray */
--success: #90EE90
--warning: #FFD700
--danger: #FFB6C1
```

### Layout
- **Mobile-first** responsive design
- **Bottom navigation** untuk mobile
- **Sidebar** untuk desktop
- **Cards** untuk pocket display
- **Charts** menggunakan Chart.js

### Halaman
1. **Landing Page** (`/`) - Apps grid + About Me
2. **Login** (`/login`) - Form login
3. **Register** (`/register`) - Form register
4. **Dashboard** (`/app`) - Ringkasan saldo, recent transactions
5. **Pockets** (`/app/pockets`) - Grid kantong
6. **Transactions** (`/app/transactions`) - Form + riwayat
7. **Budgets** (`/app/budgets`) - Budget tracker
8. **Reports** (`/app/reports`) - Charts + export

---

## 6. Technical Requirements

### Frontend
| Komponen | Teknologi |
|----------|-----------|
| Framework | Vanilla JS |
| Build Tool | Vite |
| Charts | Chart.js |
| Export PDF | jsPDF / html2pdf.js |
| Export Excel | SheetJS (xlsx) |
| State | Simple object store |
| Router | Custom hash router |

### Backend
| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Validation | express-validator |

### Infrastructure
| Komponen | Teknologi |
|----------|-----------|
| Container | Docker + Docker Compose |
| Reverse Proxy | Caddy |
| SSL | Auto (Caddy) |
| VPS | 2 vCPU, 2GB RAM |

### API Endpoints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/pockets | List pockets |
| POST | /api/pockets | Create pocket |
| PUT | /api/pockets/:id | Update pocket |
| DELETE | /api/pockets/:id | Delete pocket |
| GET | /api/transactions | List transactions |
| POST | /api/transactions | Create transaction |
| POST | /api/transactions/transfer | Transfer antar pocket |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/budgets | List budgets |
| POST | /api/budgets | Create budget |
| PUT | /api/budgets/:id | Update budget |
| DELETE | /api/budgets/:id | Delete budget |
| GET | /api/reports/summary | Daily summary |
| GET | /api/reports/weekly | Weekly summary |
| GET | /api/reports/monthly | Monthly summary |
| GET | /api/reports/by-category | By category |
| GET | /api/reports/by-pocket | By pocket |
| GET | /api/reports/export | Export data |
| GET | /api/notifications | List notifications |
| PUT | /api/notifications/:id/read | Mark read |
| DELETE | /api/notifications/:id | Delete notification |

### Database Schema
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

---

## 7. Security

| Layer | Implementation |
|-------|----------------|
| Password | bcrypt hash, salt rounds 10 |
| Auth | JWT, expiry 24 jam |
| API | Rate limiting (100 req/15 min) |
| CORS | Hanya izinkan origin sendiri |
| Input | Sanitasi semua input, prepared statements |
| Docker | Non-root user, read-only filesystem |

---

## 8. Deployment

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
```

### Caddy Config
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

### Access
- Landing Page: `http://129.226.152.163/`
- App: `http://129.226.152.163/app`

---

## 9. Development Phases

| Phase | Fitur | Estimasi |
|-------|-------|----------|
| 1 | Project setup + Landing page | 1-2 hari |
| 2 | Backend setup + Auth | 1-2 hari |
| 3 | Frontend core (router, store, API) | 1-2 hari |
| 4 | Pockets CRUD | 1-2 hari |
| 5 | Transactions + Transfer | 2 hari |
| 6 | Budgeting | 1 hari |
| 7 | Reports + Charts | 2 hari |
| 8 | Export PDF/Excel | 1 hari |
| 9 | Notifications | 1 hari |
| 10 | Offline/Sync | 1-2 hari |
| 11 | Docker + Deploy | 1 hari |
| **Total** | | **~14-18 hari** |

---

## 10. Success Criteria

- [ ] User bisa register & login
- [ ] User bisa CRUD pockets
- [ ] User bisa tambah income/expense
- [ ] User bisa transfer antar pocket
- [ ] User bisa set & monitor budget
- [ ] User bisa lihat charts (pie, line, bar)
- [ ] User bisa export PDF & Excel
- [ ] User bisa akses dari mobile
- [ ] App bisa jalan offline
- [ ] App deployed di VPS via Docker

---

## 11. Out of Scope (v1)

- Multi-user / family sharing
- Recurring transactions
- Currency conversion
- Bank integration
- Mobile app (native)
- Push notifications (browser)
