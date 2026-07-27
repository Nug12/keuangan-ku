import { api } from '../api.js';
import { store } from '../store.js';
import { t, getLang, translatePocketName } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';

export async function renderBudgets() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('budgets'));

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div class="page-header" style="margin-bottom:1.25rem">
            <h1><i class="fa-solid fa-bullseye" style="color:var(--primary)"></i> ${t('budgetsTitle')}</h1>
            <button class="btn btn-primary" id="addBudget"><i class="fa-solid fa-plus"></i> ${t('addBudget')}</button>
        </div>

        <!-- Global Budget Summary -->
        <div id="globalBudgetSummary" class="card" style="margin-bottom:1.5rem"></div>

        <div class="budgets-grid" id="budgetsGrid"></div>
        <div class="modal-overlay" id="modal" style="display:none">
            <div class="modal">
                <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
                    <h2 id="budgetModalTitle" style="margin:0;font-size:1.15rem;font-weight:700">${t('addBudget')}</h2>
                    <button type="button" id="closeModalCross" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-secondary);padding:0 0.25rem;line-height:1;margin:0">&times;</button>
                </div>
                <form id="budgetForm">
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('pocket')}</label>
                        <select id="budgetPocket" required style="width:100%"></select>
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('amount')}</label>
                        <div class="input-with-icon">
                            <input type="text" id="budgetAmountDisplay" required placeholder="0" style="width:100%">
                            <input type="hidden" id="budgetAmount" value="0">
                            <button type="button" class="input-icon-btn" id="budgetCalcBtn" title="Kalkulator"><i class="fa-solid fa-calculator"></i></button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">Pilih Ikon Target Budget</label>
                        <div class="icon-picker" id="budgetIconPicker"></div>
                        <input type="hidden" id="budgetIcon" value="fa-solid fa-bullseye">
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('period')}</label>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
                            <input type="date" id="budgetStart" required>
                            <input type="date" id="budgetEnd" required>
                        </div>
                    </div>
                    <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
                        <button type="button" class="btn btn-secondary" id="cancelBtn" style="flex:1;margin-right:0">${t('cancel')}</button>
                        <button type="submit" class="btn btn-primary" style="flex:1;margin-right:0">${t('save')}</button>
                    </div>
                </form>
            </div>
        </div>`;
    app.appendChild(content);

    setupBudgetIconPicker();

    const pockets = await api.getPockets();
    store.setPockets(pockets);
    const sel = document.getElementById('budgetPocket');
    sel.innerHTML = `<option value="">-- ${t('pocket')} --</option>`;
    pockets.forEach(p => { sel.innerHTML += `<option value="${p.id}">${translatePocketName(p.name)}</option>`; });

    await loadBudgets();
    document.getElementById('addBudget').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeModalCross').addEventListener('click', closeModal);
    document.getElementById('budgetForm').addEventListener('submit', handleSubmit);
    
    // Setup number formatting
    const displayInput = document.getElementById('budgetAmountDisplay');
    const hiddenInput = document.getElementById('budgetAmount');
    
    displayInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') value = '0';
        hiddenInput.value = value;
        displayInput.value = parseInt(value).toLocaleString('id-ID');
    });
    
    // Calculator button
    document.getElementById('budgetCalcBtn').addEventListener('click', async () => {
        const { Calculator } = await import('../components/Calculator.js');
        const calc = new Calculator();
        const currentValue = parseInt(hiddenInput.value) || 0;
        const result = await calc.show(currentValue);
        if (result !== null) {
            hiddenInput.value = result;
            displayInput.value = result.toLocaleString('id-ID');
        }
    });
}

function setupBudgetIconPicker() {
    const icons = [
        'fa-solid fa-bullseye', 'fa-solid fa-chart-pie', 'fa-solid fa-wallet', 'fa-solid fa-vault',
        'fa-solid fa-shield-halved', 'fa-solid fa-receipt', 'fa-solid fa-scale-balanced', 'fa-solid fa-sliders',
        'fa-solid fa-cart-shopping', 'fa-solid fa-calculator', 'fa-solid fa-calendar-days', 'fa-solid fa-coins'
    ];
    const picker = document.getElementById('budgetIconPicker');
    if (!picker) return;
    picker.innerHTML = '';
    icons.forEach(ic => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-opt' + (ic === 'fa-solid fa-bullseye' ? ' active' : '');
        btn.innerHTML = `<i class="${ic}"></i>`;
        btn.addEventListener('click', (e) => { 
            e.preventDefault();
            picker.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            document.getElementById('budgetIcon').value = ic; 
        });
        picker.appendChild(btn);
    });
}

async function loadBudgets() {
    const budgets = await api.getBudgets();
    const summaryCard = document.getElementById('globalBudgetSummary');
    const grid = document.getElementById('budgetsGrid');
    grid.innerHTML = '';
    const isEn = getLang() === 'en';
    const loc = isEn ? 'en-US' : 'id-ID';

    // Calculate global stats
    const totalAllocated = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalRemaining = totalAllocated - totalSpent;
    const globalPct = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

    let statusBadge = `<span style="padding:0.2rem 0.55rem;border-radius:6px;background:rgba(22,163,74,0.15);color:#16a34a;font-weight:700;font-size:0.75rem">${isEn ? 'Safe' : 'Aman'}</span>`;
    let globalBarColor = '#10b981';
    if (globalPct > 90) {
        statusBadge = `<span style="padding:0.2rem 0.55rem;border-radius:6px;background:rgba(225,29,72,0.15);color:#e11d48;font-weight:700;font-size:0.75rem">${isEn ? 'Exceeded' : 'Kritis / Melebihi'}</span>`;
        globalBarColor = '#e11d48';
    } else if (globalPct > 75) {
        statusBadge = `<span style="padding:0.2rem 0.55rem;border-radius:6px;background:rgba(217,119,6,0.15);color:#d97706;font-weight:700;font-size:0.75rem">${isEn ? 'Warning' : 'Waspada'}</span>`;
        globalBarColor = '#d97706';
    }

    if (summaryCard) {
        summaryCard.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                <div style="display:flex;align-items:center;gap:0.6rem">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.1rem">
                        <i class="fa-solid fa-chart-pie"></i>
                    </div>
                    <div>
                        <h2 style="margin:0;font-size:1.05rem;font-weight:700">${isEn ? 'Global Budget Summary' : 'Ringkasan Global Budget'}</h2>
                        <span style="font-size:0.78rem;color:var(--text-secondary)">${isEn ? 'Total allocation & accumulated spending for all budgets' : 'Total alokasi & akumulasi pengeluaran semua anggaran'}</span>
                    </div>
                </div>
                <div>${statusBadge}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:1rem;margin-bottom:1rem">
                <div>
                    <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:600">${isEn ? 'Total Allocated Budget' : 'Total Alokasi Budget'}</span>
                    <h3 style="margin:0.2rem 0 0 0;font-size:1.25rem;font-weight:700">Rp ${totalAllocated.toLocaleString(loc)}</h3>
                </div>
                <div>
                    <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:600">${isEn ? 'Total Spent' : 'Total Terpakai'}</span>
                    <h3 style="margin:0.2rem 0 0 0;font-size:1.25rem;font-weight:700;color:${globalBarColor}">Rp ${totalSpent.toLocaleString(loc)}</h3>
                </div>
                <div>
                    <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:600">${isEn ? 'Total Remaining Budget' : 'Sisa Budget Total'}</span>
                    <h3 style="margin:0.2rem 0 0 0;font-size:1.25rem;font-weight:700;color:${totalRemaining >= 0 ? '#16a34a' : '#e11d48'}">Rp ${totalRemaining.toLocaleString(loc)}</h3>
                </div>
                <div>
                    <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:600">${isEn ? 'Global Usage' : 'Penggunaan Global'}</span>
                    <h3 style="margin:0.2rem 0 0 0;font-size:1.25rem;font-weight:700;color:${globalBarColor}">${globalPct}%</h3>
                </div>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="width:${globalPct}%;height:100%;background:${globalBarColor};transition:width 0.3s"></div>
            </div>
        `;
    }

    if (budgets.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-secondary)"><i class="fa-solid fa-bullseye" style="font-size:2.5rem;margin-bottom:0.75rem;display:block"></i>${isEn ? 'No budgets found. Click "Add Budget" to create a budget target.' : 'Belum ada budget. Klik "Tambah Budget" untuk membuat target pengeluaran.'}</div>`;
        return;
    }

    budgets.forEach(b => {
        const card = document.createElement('div');
        card.className = 'card budget-card';
        const spent = b.spent || 0;
        const amount = b.amount || 0;
        const remaining = amount - spent;
        const pct = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;

        let badge = `<span style="padding:0.15rem 0.45rem;border-radius:6px;background:rgba(22,163,74,0.15);color:#16a34a;font-weight:700;font-size:0.72rem">${isEn ? 'Safe' : 'Aman'}</span>`;
        let barColor = '#10b981';
        if (pct > 90) {
            badge = `<span style="padding:0.15rem 0.45rem;border-radius:6px;background:rgba(225,29,72,0.15);color:#e11d48;font-weight:700;font-size:0.72rem">${isEn ? 'Exceeded' : 'Habis / Over'}</span>`;
            barColor = '#e11d48';
        } else if (pct > 75) {
            badge = `<span style="padding:0.15rem 0.45rem;border-radius:6px;background:rgba(217,119,6,0.15);color:#d97706;font-weight:700;font-size:0.72rem">${isEn ? 'Warning' : 'Waspada'}</span>`;
            barColor = '#d97706';
        }

        const pocketTitle = translatePocketName(b.pocket_name) || t('budgetsTitle');
        const periodLabel = b.period === 'weekly' ? t('weekly') : t('monthly');
        const iconClass = b.icon || b.pocket_icon || 'fa-solid fa-bullseye';

        // Daily limit calculation
        const endDate = b.end_date ? new Date(b.end_date) : new Date();
        const now = new Date();
        const diffMs = endDate - now;
        const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const dailyLimit = remaining > 0 ? Math.floor(remaining / daysLeft) : 0;

        card.innerHTML = `
            <div class="budget-card-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
                <h3 style="margin:0;font-size:1.05rem;display:flex;align-items:center;gap:0.5rem">
                    <i class="${iconClass}" style="color:${b.pocket_color || 'var(--primary)'}"></i> 
                    ${pocketTitle}
                </h3>
                <div style="display:flex;align-items:center;gap:0.4rem">
                    ${badge}
                    <button class="btn-icon-sm edit-budget" data-id="${b.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon-sm btn-danger-sm delete-budget" data-id="${b.id}" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <p class="budget-pocket" style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem">${periodLabel} • ${b.start_date||''} ${isEn ? 'to' : 's/d'} ${b.end_date||''}</p>
            
            <div class="budget-bar-lg" style="height:10px;background:var(--border);border-radius:5px;overflow:hidden;margin-bottom:0.5rem">
                <div class="budget-fill-lg" style="width:${pct}%;height:100%;background:${barColor};transition:width 0.3s"></div>
            </div>
            
            <div class="budget-stats" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.25rem;font-size:0.78rem;font-weight:600;margin-bottom:0.75rem">
                <div><span style="color:var(--text-secondary);font-weight:400;display:block;font-size:0.7rem">${isEn ? 'Spent' : 'Terpakai'}</span>Rp ${spent.toLocaleString(loc)}</div>
                <div style="text-align:center"><span style="color:var(--text-secondary);font-weight:400;display:block;font-size:0.7rem">${isEn ? 'Remaining' : 'Sisa'}</span><span style="color:${remaining >= 0 ? '#16a34a' : '#e11d48'}">Rp ${remaining.toLocaleString(loc)}</span></div>
                <div style="text-align:right"><span style="color:var(--text-secondary);font-weight:400;display:block;font-size:0.7rem">Total</span>Rp ${amount.toLocaleString(loc)}</div>
            </div>

            <div style="padding:0.45rem 0.65rem;background:var(--border);border-radius:8px;font-size:0.76rem;color:var(--text-secondary);display:flex;align-items:center;justify-content:space-between">
                <span><i class="fa-solid fa-lightbulb" style="color:#f59e0b;margin-right:0.25rem"></i> ${isEn ? 'Daily Limit:' : 'Batas Harian:'}</span>
                <strong style="color:var(--text-main)">Rp ${dailyLimit.toLocaleString(loc)}/${isEn ? 'day' : 'hari'} <span style="font-weight:400">(${daysLeft} ${isEn ? 'days' : 'hr'})</span></strong>
            </div>`;
        grid.appendChild(card);
    });
    
    // Edit buttons
    grid.querySelectorAll('.edit-budget').forEach(btn => {
        btn.addEventListener('click', async () => {
            const budget = budgets.find(b => b.id === btn.dataset.id);
            if (budget) openEditModal(budget);
        });
    });
    
    // Delete buttons
    grid.querySelectorAll('.delete-budget').forEach(btn => {
        btn.addEventListener('click', async () => { 
            const { showConfirm } = await import('../utils/alerts.js');
            const confirmed = await showConfirm(t('deleteBudgetConfirm'), t('deleteTitle'));
            if (confirmed) { 
                await api.deleteBudget(btn.dataset.id); 
                await loadBudgets(); 
            } 
        });
    });
}

function openModal() {
    const now = new Date();
    document.getElementById('budgetStart').value = now.toISOString().slice(0,10);
    document.getElementById('budgetEnd').value = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
    document.getElementById('budgetAmount').value = '0';
    document.getElementById('budgetAmountDisplay').value = '0';
    document.getElementById('budgetPocket').value = '';
    document.getElementById('modal').dataset.editId = '';
    document.getElementById('budgetModalTitle').textContent = t('addBudget');
    document.getElementById('modal').style.display = 'flex';
}

function openEditModal(budget) {
    const amount = parseInt(budget.amount) || 0;
    document.getElementById('budgetAmount').value = amount;
    document.getElementById('budgetAmountDisplay').value = amount.toLocaleString('id-ID');
    document.getElementById('budgetPocket').value = budget.pocket_id;
    document.getElementById('budgetStart').value = budget.start_date;
    document.getElementById('budgetEnd').value = budget.end_date;
    document.getElementById('modal').dataset.editId = budget.id;
    document.getElementById('budgetModalTitle').textContent = t('editBudget');
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

async function handleSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('modal').dataset.editId;
    const data = {
        pocket_id: document.getElementById('budgetPocket').value,
        amount: Number(document.getElementById('budgetAmount').value),
        period: 'monthly',
        start_date: document.getElementById('budgetStart').value,
        end_date: document.getElementById('budgetEnd').value
    };
    
    if (editId) {
        await api.updateBudget(editId, data);
    } else {
        await api.createBudget(data);
    }
    closeModal();
    await loadBudgets();
}
