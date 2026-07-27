# KeuanganKu 💰

Aplikasi web pengelolaan keuangan pribadi yang ringan, cepat, responsif, dan mudah digunakan dengan dukungan bilingual (Indonesia/English) dan dark mode.

## ✨ Features

### 🎨 UI/UX
- 🌊 **Ocean Mint Theme** — Light mode (cream #E8F4F8) & Dark mode (navy #2A3F4A)
- 🌐 **Bilingual** — Indonesia/English toggle dengan full page re-render
- 🎯 **Smooth Toggles** — Theme & language switching tanpa reload
- 📱 **Responsive** — Mobile-first design
- 🧮 **Calculator Integration** — Built-in calculator untuk input amount
- 💯 **Thousand Separator** — Format ribuan (20.000, 1.500.000)
- 🎨 **Custom Modals** — Ocean Mint themed popups (no browser defaults)

### 💼 Core Features
- 💰 **Multi-Pockets** — Kantong terpisah dengan 24 icon choices & 18 warna
- 💸 **Transactions** — Income/expense tracking dengan kategori
- 📊 **Budget Tracking** — Set & monitor budget per kategori
- 📁 **Categories** — Custom kategori dengan icon & warna
- 📈 **Dashboard Insights** — Summary cards dengan Font Awesome icons
- 📊 **Reports & Charts** — Visualisasi data (Pie, Line, Bar)
- 📄 **Export** — PDF & Excel export
- 🔔 **Notifications** — In-app alerts

### 🔐 Technical
- 🔒 **Authentication** — JWT + bcrypt
- 🌐 **Offline-first** — Service worker support
- ⚡ **Fast** — Vite build dengan IIFE bundle
- 🐳 **Dockerized** — Production-ready container

## Tech Stack

- **Frontend:** Vanilla JS + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Container:** Docker
- **Reverse Proxy:** Caddy

## Quick Start

### Development

```bash
# Clone repository
git clone <repository-url>
cd keuangan-ku

# Setup backend
cd server
npm install
npm run dev

# Setup frontend (new terminal)
cd client
npm install
npm run dev
```

### Production (Docker)

```bash
# Build and run
docker compose build
docker compose up -d

# Check logs
docker compose logs -f
```

## 🚀 Demo & Access

### Production
- **Live App:** https://keuanganku.nug12.biz.id
- **Landing Page:** https://nug12.biz.id

### Demo Accounts

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| demo123@keuanganku.com | demo123 | Demo | Read-only demo account (resets daily) |
| admin123@keuanganku.com | admin123 | Admin | Full admin access |
| user123@keuanganku.com | user123 | User | Standard user account |

**Note:** Demo account database resets daily at 00:00 UTC. Production accounts (nug12@nug12.biz.id) are NOT included in public repository.

## Project Structure

```
keuangan-ku/
├── client/          # Frontend (Vite + Vanilla JS)
├── server/          # Backend (Node.js + Express)
├── landing/         # Landing Page (static)
├── docs/            # Documentation
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Documentation

- [Design Spec](docs/specs/2026-07-23-keuangan-ku-design.md)
- [Implementation Plan](docs/plans/2026-07-23-keuangan-ku-implementation.md)
- [PRD](docs/prd/2026-07-23-keuangan-ku-prd.md)

## License

MIT
