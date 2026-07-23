import { Calculator } from './Calculator.js';

export function TransactionForm(pockets, onSubmit) {
    const form = document.createElement('form');
    form.className = 'transaction-form';

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    form.innerHTML = `
        <h3>Tambah Transaksi</h3>
        <div class="form-tabs">
            <button type="button" class="tab active" data-type="expense">Pengeluaran</button>
            <button type="button" class="tab" data-type="income">Pemasukan</button>
        </div>
        <input type="hidden" id="txnType" value="expense">

        <div class="form-row">
            <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="txnDate" value="${dateStr}" required>
            </div>
            <div class="form-group">
                <label>Waktu</label>
                <input type="time" id="txnTime" value="${timeStr}" required>
            </div>
        </div>

        <label>Kantong</label>
        <select id="txnPocket" required>
            ${pockets.map(p => `<option value="${p.id}"><i class="${p.icon}"></i> ${p.name}</option>`).join('')}
        </select>

        <label>Nominal</label>
        <div class="input-with-icon">
            <span class="input-prefix">Rp</span>
            <input type="number" id="txnAmount" required min="1" placeholder="0" class="input-amount">
            <button type="button" class="calc-trigger" id="calcBtn">
                <i class="fa-solid fa-calculator"></i>
            </button>
        </div>

        <label>Kategori</label>
        <select id="txnCategory">
            <option value="makanan"><i class="fa-solid fa-utensils"></i> Makanan</option>
            <option value="transport"><i class="fa-solid fa-car"></i> Transport</option>
            <option value="belanja"><i class="fa-solid fa-cart-shopping"></i> Belanja</option>
            <option value="tagihan"><i class="fa-solid fa-file-invoice"></i> Tagihan</option>
            <option value="hiburan"><i class="fa-solid fa-gamepad"></i> Hiburan</option>
            <option value="gaji"><i class="fa-solid fa-money-bill"></i> Gaji</option>
            <option value="lainnya"><i class="fa-solid fa-box"></i> Lainnya</option>
        </select>

        <label>Deskripsi</label>
        <input type="text" id="txnDescription" placeholder="Opsional">

        <button type="submit" class="btn btn-primary btn-block">
            <i class="fa-solid fa-check"></i> Simpan
        </button>
    `;

    // Tab switching
    form.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            form.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('txnType').value = tab.dataset.type;
        });
    });

    // Calculator trigger
    const amountInput = form.querySelector('#txnAmount');
    form.querySelector('#calcBtn').addEventListener('click', () => {
        document.body.appendChild(Calculator(amountInput));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('txnDate').value;
        const time = document.getElementById('txnTime').value;
        const created_at = `${date}T${time}:00.000Z`;

        onSubmit({
            pocket_id: document.getElementById('txnPocket').value,
            type: document.getElementById('txnType').value,
            amount: parseFloat(document.getElementById('txnAmount').value),
            category: document.getElementById('txnCategory').value,
            description: document.getElementById('txnDescription').value,
            created_at,
        });
    });

    return form;
}
