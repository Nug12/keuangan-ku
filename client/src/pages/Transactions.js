import { api } from '../api.js';
import { store } from '../store.js';
import { t, getLang, translateCategoryName, translateDescription } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';
import { TransactionForm } from '../components/TransactionForm.js';
import { TransferForm } from '../components/TransferForm.js';

let showAll = false;
const LIMIT = 10;

export async function renderTransactions() {
    const app = document.getElementById('app');
    showAll = false;
    app.innerHTML = '';
    app.appendChild(renderNavbar('transactions'));

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div class="page-header"><h1><i class="fa-solid fa-credit-card"></i> ${t('transactionsTitle')}</h1></div>
        <div class="txn-layout">
            <div class="txn-form-side"><div class="card" id="formCard"></div></div>
            <div class="txn-list-side"><div class="card">
                <div class="card-header"><div class="card-header-left"><div class="card-icon"><i class="fa-solid fa-clock-rotate-left"></i></div><h2>${t('history')}</h2></div></div>
                <div id="transactionList"></div>
                <button class="btn btn-secondary btn-block" id="toggleAll" style="display:none;margin-top:0.75rem"><i class="fa-solid fa-list"></i> ${t('viewAll')}</button>
            </div></div>
        </div>`;
    app.appendChild(content);

    const [pockets, txns, categories] = await Promise.all([
        api.getPockets(),
        api.getTransactions(),
        api.getCategories()
    ]);
    store.setPockets(pockets);
    store.setTransactions(txns);
    window._categories = categories || [];
    renderTransactionList();
    showTransactionForm();

    document.getElementById('toggleAll').addEventListener('click', () => { showAll = !showAll; renderTransactionList(); });
}

function renderTransactionList() {
    const list = document.getElementById('transactionList');
    const toggleBtn = document.getElementById('toggleAll');
    list.innerHTML = '';
    const isEn = getLang() === 'en';
    const loc = isEn ? 'en-US' : 'id-ID';

    const catIcons = { makanan:'fa-solid fa-utensils', transport:'fa-solid fa-car', belanja:'fa-solid fa-cart-shopping', tagihan:'fa-solid fa-file-invoice', hiburan:'fa-solid fa-gamepad', gaji:'fa-solid fa-money-bill', transfer:'fa-solid fa-arrow-right-arrow-left', lainnya:'fa-solid fa-box' };
    const items = showAll ? store.transactions : store.transactions.slice(0, LIMIT);

    if (items.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-secondary);font-size:0.9rem">${isEn ? 'No transactions found' : 'Belum ada transaksi'}</div>`;
        return;
    }

    items.forEach(txn => {
        const item = document.createElement('div');
        item.className = 'list-row';
        const isInc = txn.type === 'income', isTf = txn.type === 'transfer';
        const iconClass = isTf ? 'fa-solid fa-arrow-right-arrow-left' : (catIcons[txn.category] || catIcons.lainnya);
        const color = isInc ? '#16a34a' : isTf ? '#0ea5e9' : '#e11d48';
        const bg = isInc ? 'rgba(22, 163, 74, 0.15)' : isTf ? 'rgba(14, 165, 233, 0.15)' : 'rgba(225, 29, 72, 0.15)';
        const d = new Date(txn.created_at);

        let title = txn.description ? translateDescription(txn.description) : '';
        if (!title) {
            if (isTf) title = isEn ? 'Transfer Between Pockets' : 'Transfer Antar Kantong';
            else title = translateCategoryName(txn.category || '') || (isEn ? 'Transaction' : 'Transaksi');
        }

        item.innerHTML = `
            <div class="list-left">
                <div class="list-icon" style="background:${bg};color:${color}"><i class="${iconClass}"></i></div>
                <div class="list-info">
                    <span class="list-name" style="font-weight:600">${title}</span>
                    <span class="list-sub" style="font-size:0.75rem;color:var(--text-secondary)">${d.toLocaleDateString(loc, {day:'numeric', month:'short'})} &bull; ${d.toLocaleTimeString(loc, {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
            <span class="list-value" style="color:${color};font-weight:600">${isInc?'+':'-'} Rp ${(txn.amount||0).toLocaleString(loc)}</span>`;
        list.appendChild(item);
    });

    if (store.transactions.length > LIMIT) { 
        toggleBtn.style.display = 'flex'; 
        toggleBtn.innerHTML = showAll 
            ? (isEn ? '<i class="fa-solid fa-chevron-up"></i> Show Less' : '<i class="fa-solid fa-chevron-up"></i> Lebih Sedikit') 
            : `<i class="fa-solid fa-list"></i> ${t('viewAll')} (${store.transactions.length})`; 
    }
}

function showTransactionForm() {
    const formCard = document.getElementById('formCard');
    formCard.innerHTML = '';
    const tabs = document.createElement('div');
    tabs.className = 'form-tabs';
    tabs.innerHTML = `<button class="tab active" data-form="transaction">${t('transaction')}</button><button class="tab" data-form="transfer">${t('transfer')}</button>`;
    const fc = document.createElement('div');
    const cats = window._categories || [];
    tabs.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => { tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); fc.innerHTML = ''; fc.appendChild(tab.dataset.form === 'transaction' ? TransactionForm(store.pockets, cats, handleTxn) : TransferForm(store.pockets, handleTf)); });
    });
    formCard.appendChild(tabs);
    formCard.appendChild(fc);
    fc.appendChild(TransactionForm(store.pockets, cats, handleTxn));
}

async function handleTxn(data) { await api.createTransaction(data); store.setTransactions(await api.getTransactions()); renderTransactionList(); showTransactionForm(); }
async function handleTf(data) { await api.transfer(data); store.setTransactions(await api.getTransactions()); renderTransactionList(); showTransactionForm(); }
