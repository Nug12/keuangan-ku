import { Calculator } from './Calculator.js';
import { t, translatePocketName, translateCategoryName } from '../i18n.js';

export function TransactionForm(pockets, categories = [], onSubmit) {
    // If 2 arguments passed (pockets, onSubmit)
    if (typeof categories === 'function') {
        onSubmit = categories;
        categories = [];
    }

    const form = document.createElement('form');
    form.className = 'transaction-form';

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    form.innerHTML = `
        <h3>${t('addTxnTitle')}</h3>
        <div class="form-tabs">
            <button type="button" class="tab active" data-type="expense">${t('expense')}</button>
            <button type="button" class="tab" data-type="income">${t('income')}</button>
        </div>
        <input type="hidden" id="txnType" value="expense">

        <div class="form-row">
            <div class="form-group">
                <label>${t('dateLabel')}</label>
                <input type="date" id="txnDate" value="${dateStr}" required>
            </div>
            <div class="form-group">
                <label>${t('timeLabel')}</label>
                <input type="time" id="txnTime" value="${timeStr}" required>
            </div>
        </div>

        <label>${t('pocket')}</label>
        <select id="txnPocket" required>
            ${pockets.map(p => `<option value="${p.id}"><i class="${p.icon}"></i> ${translatePocketName(p.name)}</option>`).join('')}
        </select>

        <label>${t('amount')}</label>
        <div class="input-with-icon">
            <span class="input-prefix">Rp</span>
            <input type="text" id="txnAmountDisplay" required placeholder="0" class="input-amount">
            <input type="hidden" id="txnAmount" value="0">
            <button type="button" class="calc-trigger" id="calcBtn">
                <i class="fa-solid fa-calculator"></i>
            </button>
        </div>

        <label>${t('category')}</label>
        <select id="txnCategory">
        </select>

        <label>${t('description')}</label>
        <textarea id="txnDescription" placeholder="${t('notePlaceholder')}" rows="2"></textarea>

        <button type="submit" class="btn btn-primary btn-block">
            <i class="fa-solid fa-check"></i> ${t('saveBtn')}
        </button>
    `;

    function updateCategoryDropdown(type) {
        const catSelect = form.querySelector('#txnCategory');
        if (!catSelect) return;

        const filtered = (categories || []).filter(c => c.type === type);
        if (filtered.length > 0) {
            catSelect.innerHTML = filtered.map(c => `<option value="${c.name.toLowerCase()}">${translateCategoryName(c.name)}</option>`).join('');
        } else {
            // Default fallbacks
            if (type === 'income') {
                catSelect.innerHTML = `<option value="gaji">${t('cat_gaji')}</option><option value="freelance">Freelance</option><option value="lainnya">${t('cat_lainnya')}</option>`;
            } else {
                catSelect.innerHTML = `<option value="makanan">${t('cat_makanan')}</option><option value="transport">${t('cat_transport')}</option><option value="belanja">${t('cat_belanja')}</option><option value="tagihan">${t('cat_tagihan')}</option><option value="hiburan">${t('cat_hiburan')}</option><option value="lainnya">${t('cat_lainnya')}</option>`;
            }
        }
    }

    // Initial category load for default 'expense' type
    updateCategoryDropdown('expense');

    // Tab switching with dynamic color & category updates
    form.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            form.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.dataset.type;
            form.querySelector('#txnType').value = type;
            updateCategoryDropdown(type);
        });
    });

    // Setup number formatting
    const displayInput = form.querySelector('#txnAmountDisplay');
    const hiddenInput = form.querySelector('#txnAmount');
    
    displayInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') value = '0';
        hiddenInput.value = value;
        displayInput.value = parseInt(value).toLocaleString('id-ID');
    });
    
    // Calculator trigger with pre-fill
    form.querySelector('#calcBtn').addEventListener('click', async () => {
        const calc = new Calculator();
        const currentValue = parseInt(hiddenInput.value) || 0;
        const result = await calc.show(currentValue);
        if (result !== null) {
            hiddenInput.value = result;
            displayInput.value = result.toLocaleString('id-ID');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = form.querySelector('#txnDate').value;
        const time = form.querySelector('#txnTime').value;
        const created_at = `${date}T${time}:00.000Z`;

        onSubmit({
            pocket_id: form.querySelector('#txnPocket').value,
            type: form.querySelector('#txnType').value,
            amount: parseFloat(hiddenInput.value),
            category: form.querySelector('#txnCategory').value,
            description: form.querySelector('#txnDescription').value,
            created_at,
        });
    });

    return form;
}
