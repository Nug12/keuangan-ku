export function TransactionForm(pockets, onSubmit) {
    const form = document.createElement('form');
    form.className = 'transaction-form';

    form.innerHTML = `
        <h3>Tambah Transaksi</h3>
        <div class="form-tabs">
            <button type="button" class="tab active" data-type="expense">Pengeluaran</button>
            <button type="button" class="tab" data-type="income">Pemasukan</button>
        </div>
        <input type="hidden" id="txnType" value="expense">
        <label>Kantong</label>
        <select id="txnPocket" required>
            ${pockets.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('')}
        </select>
        <label>Nominal</label>
        <input type="number" id="txnAmount" required min="1">
        <label>Kategori</label>
        <select id="txnCategory">
            <option value="makanan">🍜 Makanan</option>
            <option value="transport">🚗 Transport</option>
            <option value="belanja">🛒 Belanja</option>
            <option value="tagihan">📄 Tagihan</option>
            <option value="hiburan">🎮 Hiburan</option>
            <option value="lainnya">📦 Lainnya</option>
        </select>
        <label>Deskripsi</label>
        <input type="text" id="txnDescription" placeholder="Opsional">
        <button type="submit" class="btn btn-primary btn-block">Simpan</button>
    `;

    // Tab switching
    form.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            form.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('txnType').value = tab.dataset.type;
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        onSubmit({
            pocket_id: document.getElementById('txnPocket').value,
            type: document.getElementById('txnType').value,
            amount: parseFloat(document.getElementById('txnAmount').value),
            category: document.getElementById('txnCategory').value,
            description: document.getElementById('txnDescription').value,
        });
    });

    return form;
}
