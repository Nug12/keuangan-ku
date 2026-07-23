# KeuanganKu 💰

Aplikasi web pengelolaan keuangan pribadi yang ringan, cepat, responsif, dan mudah digunakan.

## Features

- 📁 Multi-kantong (Pockets)
- 💸 Transfer antar kantong
- 📊 Budget tracking
- 📈 Reports & Charts (Pie, Line, Bar)
- 📄 Export PDF & Excel
- 🔔 In-app notifications
- 📱 Responsive (mobile-first)
- 🔒 Authentication (JWT + bcrypt)
- 🌐 Offline-first support

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

## Access

- **Landing Page:** http://129.226.152.163/
- **App:** http://129.226.152.163/app

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
