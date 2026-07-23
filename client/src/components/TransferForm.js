import { Calculator } from './Calculator.js';

export function TransferForm(pockets, onSubmit) {
    const form = document.createElement('form');
    form.className = 'transfer-form';

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    form.innerHTML = `
        <h3>Transfer Antar Kantong</h3>

        <div class="form-row">
            <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="transferDate" value="${dateStr}" required>
            </div>
            <div class="form-group">
                <label>Waktu</label>
                <input type="time" id="transferTime" value="${timeStr}" required>
            </div>
        </div>

        <label>Dari Kantong</label>
        <select id="fromPocket" required>
            ${pockets.map(p => `<option value="${p.id}">${p.icon} ${p.name} (Rp ${p.balance.toLocaleString('id-ID')})</option>`).join('')}
        </select>

        <label>Ke Kantong</label>
        <select id="toPocket" required>
            ${pockets.map(p => `<option value="${p.id}">${p.icon} ${p.name} (Rp ${p.balance.toLocaleString('id-ID')})</option>`).join('')}
        </select>

        <label>Nominal</label>
        <div class="input-with-icon">
            <span class="input-prefix">Rp</span>
            <input type="number" id="transferAmount" required min="1" placeholder="0" class="input-amount">
            <button type="button" class="calc-trigger" id="calcBtnTransfer">
                <i class="fa-solid fa-calculator"></i>
            </button>
        </div>

        <label>Catatan</label>
        <input type="text" id="transferNote" placeholder="Opsional">

        <button type="submit" class="btn btn-primary btn-block">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> Transfer
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
