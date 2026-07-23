import { api } from '../api.js';
import { store } from '../store.js';
import { navigate } from '../router.js';
import { NotificationBell } from '../components/NotificationBell.js';

export async function renderDashboard() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <nav class="navbar-app">
                <div class="logo"><i class="fa-solid fa-wallet"></i> KeuanganKu</div>
                <div class="nav-links">
                    <a href="#/keuanganku" class="active">Dashboard</a>
                    <a href="#/keuanganku/pockets">Kantong</a>
                    <a href="#/keuanganku/transactions">Transaksi</a>
                    <a href="#/keuanganku/budgets">Budget</a>
                    <a href="#/keuanganku/reports">Laporan</a>
                </div>
                <div class="nav-right">
                    <div id="notifBell"></div>
                    <button class="btn btn-secondary" id="logoutBtn">Keluar</button>
                </div>
            </nav>

            <div class="dashboard">
                <h1>Dashboard</h1>

                <div class="summary-cards" id="summaryCards">
                    <div class="card summary-card">
                        <p class="summary-label">Total Saldo</p>
                        <p class="summary-value" id="totalBalance">-</p>
                    </div>
                    <div class="card summary-card income">
                        <p class="summary-label">Pemasukan Hari Ini</p>
                        <p class="summary-value" id="todayIncome">-</p>
                    </div>
                    <div class="card summary-card expense">
                        <p class="summary-label">Pengeluaran Hari Ini</p>
                        <p class="summary-value" id="todayExpense">-</p>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="card">
                        <h2>Kantong Saya</h2>
                        <div id="pocketsList"></div>
                        <a href="#/keuanganku/pockets" class="btn btn-secondary btn-block">Lihat Semua</a>
                    </div>
                    <div class="card">
                        <h2>Transaksi Terakhir</h2>
                        <div id="recentTransactions"></div>
                        <a href="#/keuanganku/transactions" class="btn btn-secondary btn-block">Lihat Semua</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load data
    await loadDashboard();

    // Add notification bell
    document.getElementById('notifBell').appendChild(NotificationBell());

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        navigate('/login');
    });
}

async function loadDashboard() {
    try {
        const [summary, pockets, transactions] = await Promise.all([
            api.getSummary(),
            api.getPockets(),
            api.getTransactions(),
        ]);

        // Update summary
        document.getElementById('totalBalance').textContent = `Rp ${summary.totalBalance.toLocaleString('id-ID')}`;
        document.getElementById('todayIncome').textContent = `+ Rp ${summary.income.toLocaleString('id-ID')}`;
        document.getElementById('todayExpense').textContent = `- Rp ${summary.expense.toLocaleString('id-ID')}`;

        // Render pockets
        const pocketsList = document.getElementById('pocketsList');
        pocketsList.innerHTML = '';
        pockets.slice(0, 4).forEach(pocket => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span><i class="${pocket.icon}" style="color:${pocket.color}"></i> ${pocket.name}</span>
                <span>Rp ${pocket.balance.toLocaleString('id-ID')}</span>
            `;
            pocketsList.appendChild(item);
        });

        // Render recent transactions
        const transactionsList = document.getElementById('recentTransactions');
        transactionsList.innerHTML = '';
        transactions.slice(0, 5).forEach(txn => {
            const item = document.createElement('div');
            item.className = 'list-item';
            const sign = txn.type === 'income' ? '+' : '-';
            const color = txn.type === 'income' ? 'var(--success)' : 'var(--danger)';
            item.innerHTML = `
                <span>${txn.description || txn.category || txn.type}</span>
                <span style="color:${color}">${sign} Rp ${txn.amount.toLocaleString('id-ID')}</span>
            `;
            transactionsList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}
