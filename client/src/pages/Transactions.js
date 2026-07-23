import { api } from '../api.js';
import { store } from '../store.js';
import { TransactionForm } from '../components/TransactionForm.js';
import { TransferForm } from '../components/TransferForm.js';

export async function renderTransactions() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <nav class="navbar-app">
                <div class="logo">💰 KeuanganKu</div>
                <div class="nav-links">
                    <a href="#/app">Dashboard</a>
                    <a href="#/app/pockets">Kantong</a>
                    <a href="#/app/transactions" class="active">Transaksi</a>
                    <a href="#/app/budgets">Budget</a>
                    <a href="#/app/reports">Laporan</a>
                </div>
                <button class="btn btn-secondary" id="logoutBtn">Keluar</button>
            </nav>

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

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
    });
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
