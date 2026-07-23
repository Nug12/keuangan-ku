import { api } from '../api.js';
import { store } from '../store.js';
import { BudgetTracker } from '../components/BudgetTracker.js';

export async function renderBudgets() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <nav class="navbar-app">
                <div class="logo"><i class="fa-solid fa-wallet"></i> KeuanganKu</div>
                <div class="nav-links">
                    <a href="#/keuanganku">Dashboard</a>
                    <a href="#/keuanganku/pockets">Kantong</a>
                    <a href="#/keuanganku/transactions">Transaksi</a>
                    <a href="#/keuanganku/budgets" class="active">Budget</a>
                    <a href="#/keuanganku/reports">Laporan</a>
                </div>
                <button class="btn btn-secondary" id="logoutBtn">Keluar</button>
            </nav>

            <div class="page-header">
                <h1><i class="fa-solid fa-chart-pie"></i> Budget</h1>
                <button class="btn btn-primary" id="addBudget"><i class="fa-solid fa-plus"></i> Tambah Budget</button>
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
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
    });
}

async function loadPockets() {
    const pockets = await api.getPockets();
    store.setPockets(pockets);

    // Populate pocket select
    const select = document.getElementById('budgetPocket');
    select.innerHTML = store.pockets.map(p =>
        `<option value="${p.id}"><i class="${p.icon}"></i> ${p.name}</option>`
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
