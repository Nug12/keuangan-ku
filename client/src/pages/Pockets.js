import { api } from '../api.js';
import { store } from '../store.js';
import { PocketCard } from '../components/PocketCard.js';

export async function renderPockets() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <nav class="navbar-app">
                <div class="logo"><i class="fa-solid fa-wallet"></i> KeuanganKu</div>
                <div class="nav-links">
                    <a href="#/keuanganku">Dashboard</a>
                    <a href="#/keuanganku/pockets" class="active">Kantong</a>
                    <a href="#/keuanganku/transactions">Transaksi</a>
                    <a href="#/keuanganku/budgets">Budget</a>
                    <a href="#/keuanganku/reports">Laporan</a>
                </div>
                <button class="btn btn-secondary" id="logoutBtn">Keluar</button>
            </nav>

            <div class="page-header">
                <h1><i class="fa-solid fa-wallet"></i> Kantong Saya</h1>
                <button class="btn btn-primary" id="addPocket"><i class="fa-solid fa-plus"></i> Tambah Kantong</button>
            </div>
            <div class="pockets-grid" id="pocketsGrid"></div>
        </div>

        <!-- Modal -->
        <div class="modal" id="modal" style="display:none">
            <div class="modal-content">
                <h2 id="modalTitle">Tambah Kantong</h2>
                <form id="pocketForm">
                    <input type="hidden" id="pocketId">
                    <label>Nama Kantong</label>
                    <input type="text" id="pocketName" required>
                    <label>Icon</label>
                    <input type="text" id="pocketIcon" value="💰">
                    <label>Warna</label>
                    <input type="color" id="pocketColor" value="#87CEEB">
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancelBtn">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Load pockets
    await loadPockets();

    // Event listeners
    document.getElementById('addPocket').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('pocketForm').addEventListener('submit', handleSubmit);
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
    });
}

async function loadPockets() {
    const pockets = await api.getPockets();
    store.setPockets(pockets);
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('pocketsGrid');
    grid.innerHTML = '';

    store.pockets.forEach(pocket => {
        const card = PocketCard(pocket, openEditModal, handleDelete);
        grid.appendChild(card);
    });
}

function openModal() {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Tambah Kantong';
    document.getElementById('pocketForm').reset();
    document.getElementById('pocketIcon').value = '💰';
    document.getElementById('pocketColor').value = '#87CEEB';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function openEditModal(pocket) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Edit Kantong';
    document.getElementById('pocketId').value = pocket.id;
    document.getElementById('pocketName').value = pocket.name;
    document.getElementById('pocketIcon').value = pocket.icon;
    document.getElementById('pocketColor').value = pocket.color;
}

async function handleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('pocketId').value;
    const data = {
        name: document.getElementById('pocketName').value,
        icon: document.getElementById('pocketIcon').value,
        color: document.getElementById('pocketColor').value,
    };

    if (id) {
        await api.updatePocket(id, data);
    } else {
        await api.createPocket(data);
    }

    closeModal();
    await loadPockets();
}

async function handleDelete(id) {
    if (confirm('Yakin ingin menghapus kantong ini?')) {
        await api.deletePocket(id);
        await loadPockets();
    }
}
