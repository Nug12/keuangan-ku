import { Calculator } from './Calculator.js';
import { t, translatePocketName } from '../i18n.js';

export function TransferForm(pockets, onSubmit) {
    const form = document.createElement('form');
    form.className = 'transfer-form';

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    form.innerHTML = `
        <h3>${t('transferTitle')}</h3>

        <div class="form-row">
            <div class="form-group">
                <label>${t('dateLabel')}</label>
                <input type="date" id="transferDate" value="${dateStr}" required>
            </div>
            <div class="form-group">
                <label>${t('timeLabel')}</label>
                <input type="time" id="transferTime" value="${timeStr}" required>
            </div>
        </div>

        <label>${t('fromPocket')}</label>
        <select id="fromPocket" required>
            ${pockets.map(p => `<option value="${p.id}"><i class="${p.icon}"></i> ${translatePocketName(p.name)} (Rp ${p.balance.toLocaleString('id-ID')})</option>`).join('')}
        </select>

        <label>${t('toPocket')}</label>
        <select id="toPocket" required>
            ${pockets.map(p => `<option value="${p.id}"><i class="${p.icon}"></i> ${translatePocketName(p.name)} (Rp ${p.balance.toLocaleString('id-ID')})</option>`).join('')}
        </select>

        <label>${t('amount')}</label>
        <div class="input-with-icon">
            <span class="input-prefix">Rp</span>
            <input type="number" id="transferAmount" required min="1" placeholder="0" class="input-amount">
            <button type="button" class="calc-trigger" id="calcBtnTransfer">
                <i class="fa-solid fa-calculator"></i>
            </button>
        </div>

        <label>${t('noteLabel')}</label>
        <input type="text" id="transferNote" placeholder="${t('optional')}">

        <button type="submit" class="btn btn-primary btn-block">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> ${t('transferBtn')}
        </button>
    `;

    // Calculator trigger
    const amountInput = form.querySelector('#transferAmount');
    form.querySelector('#calcBtnTransfer').addEventListener('click', () => {
        document.body.appendChild(Calculator(amountInput));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('transferDate').value;
        const time = document.getElementById('transferTime').value;
        const created_at = `${date}T${time}:00.000Z`;

        onSubmit({
            from_pocket_id: document.getElementById('fromPocket').value,
            to_pocket_id: document.getElementById('toPocket').value,
            amount: parseFloat(document.getElementById('transferAmount').value),
            description: document.getElementById('transferNote').value,
            created_at,
        });
    });

    return form;
}
