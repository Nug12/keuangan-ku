import { api } from '../api.js';
import { store } from '../store.js';
import { t, getLang, translatePocketName } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';

export async function renderPockets() {
    const isEn = getLang() === 'en';
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('pockets'));

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fa-solid fa-wallet"></i> ${t('pocketsTitle')}</h1>
            <button class="btn btn-primary" id="addPocket"><i class="fa-solid fa-plus"></i> ${t('addPocket')}</button>
        </div>
        <div class="pockets-grid" id="pocketsGrid"></div>
        <div class="modal-overlay" id="modal" style="display:none">
            <div class="modal">
                <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
                    <h2 id="modalTitle" style="margin:0;font-size:1.15rem;font-weight:700">${t('addPocket')}</h2>
                    <button type="button" id="closeModalCross" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-secondary);padding:0 0.25rem;line-height:1;margin:0">&times;</button>
                </div>
                <form id="pocketForm">
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('pocketName')}</label>
                        <input type="text" id="pocketName" placeholder="${isEn ? 'e.g. Main Wallet' : 'Contoh: Dompet Utama'}" required style="width:100%">
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('initialBalance')}</label>
                        <div class="input-with-icon">
                            <input type="text" id="pocketBalanceDisplay" placeholder="0" required style="width:100%">
                            <input type="hidden" id="pocketBalance" value="0">
                            <button type="button" class="input-icon-btn" id="calcBtn" title="Kalkulator"><i class="fa-solid fa-calculator"></i></button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('icon')}</label>
                        <div class="icon-picker" id="iconPicker"></div>
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('color')}</label>
                        <div class="color-picker" id="colorPicker"></div>
                    </div>
                    <input type="hidden" id="pocketIcon" value="fa-solid fa-wallet">
                    <input type="hidden" id="pocketColor" value="#87CEEB">
                    <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
                        <button type="button" class="btn btn-secondary" id="cancelBtn" style="flex:1;margin-right:0">${t('cancel')}</button>
                        <button type="submit" class="btn btn-primary" style="flex:1;margin-right:0">${t('save')}</button>
                    </div>
                </form>
            </div>
        </div>`;
    app.appendChild(content);

    await loadPockets();
    setupPickers();

    document.getElementById('addPocket').addEventListener('click', openModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeModalCross').addEventListener('click', closeModal);
    document.getElementById('pocketForm').addEventListener('submit', handleSubmit);
}

async function loadPockets() {
    const pockets = await api.getPockets();
    store.setPockets(pockets);
    const grid = document.getElementById('pocketsGrid');
    grid.innerHTML = '';
    pockets.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pocket-card';
        card.innerHTML = `
            <div class="pocket-card-top" style="background:${p.color}15">
                <div class="pocket-card-icon" style="background:${p.color};color:#fff"><i class="${p.icon}"></i></div>
                <div class="pocket-card-actions">
                    <button class="btn-icon-sm edit-pocket" data-id="${p.id}" data-name="${p.name}" data-balance="${p.balance||0}" data-icon="${p.icon}" data-color="${p.color}"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon-sm btn-danger-sm delete-pocket" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="pocket-card-body">
                <h3>${translatePocketName(p.name)}</h3>
                <p class="pocket-balance">Rp ${(p.balance||0).toLocaleString('id-ID')}</p>
            </div>`;
        grid.appendChild(card);
    });

    grid.querySelectorAll('.edit-pocket').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = t('editPocket');
            document.getElementById('pocketName').value = btn.dataset.name;
            const balance = parseInt(btn.dataset.balance) || 0;
            document.getElementById('pocketBalance').value = balance;
            document.getElementById('pocketBalanceDisplay').value = balance.toLocaleString('id-ID');
            document.getElementById('pocketIcon').value = btn.dataset.icon;
            document.getElementById('pocketColor').value = btn.dataset.color;
            window._editId = btn.dataset.id;
            openModal();
        });
    });

    grid.querySelectorAll('.delete-pocket').forEach(btn => {
        btn.addEventListener('click', async () => {
            const { showConfirm } = await import('../utils/alerts.js');
            const confirmed = await showConfirm('Apakah kamu yakin ingin menghapus kantong ini?', 'Hapus Kantong');
            if (confirmed) {
                await api.deletePocket(btn.dataset.id);
                await loadPockets();
            }
        });
    });
}

function setupPickers() {
    const icons = [
        'fa-solid fa-wallet',
        'fa-solid fa-vault',
        'fa-solid fa-money-bill',
        'fa-solid fa-credit-card',
        'fa-solid fa-building-columns',
        'fa-solid fa-landmark',
        'fa-solid fa-coins',
        'fa-solid fa-hand-holding-dollar',
        'fa-solid fa-chart-line',
        'fa-solid fa-briefcase',
        'fa-solid fa-gift',
        'fa-solid fa-heart',
        'fa-solid fa-star',
        'fa-solid fa-laptop-code',
        'fa-solid fa-graduation-cap',
        'fa-solid fa-plane',
        'fa-solid fa-car',
        'fa-solid fa-house',
        'fa-solid fa-utensils',
        'fa-solid fa-shopping-cart',
        'fa-solid fa-gamepad',
        'fa-solid fa-dumbbell',
        'fa-solid fa-book',
        'fa-solid fa-lightbulb'
    ];
    
    const iconPicker = document.getElementById('iconPicker');
    iconPicker.innerHTML = '';
    icons.forEach(ic => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-opt';
        btn.innerHTML = `<i class="${ic}"></i>`;
        btn.addEventListener('click', (e) => { 
            e.preventDefault();
            iconPicker.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            document.getElementById('pocketIcon').value = ic; 
        });
        iconPicker.appendChild(btn);
    });

    const colors = [
        '#87CEEB', '#90EE90', '#FFB6C1', '#FFD700', '#DDA0DD', '#98FB98',
        '#B0E0E6', '#F0E68C', '#FFA07A', '#87CEFA', '#FF6B6B', '#4ECDC4',
        '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.innerHTML = '';
    colors.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-opt';
        btn.style.background = c;
        btn.addEventListener('click', (e) => { 
            e.preventDefault();
            colorPicker.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            document.getElementById('pocketColor').value = c; 
        });
        colorPicker.appendChild(btn);
    });
}

function openModal() { 
    document.getElementById('modal').style.display = 'flex';
    
    // Setup number formatting for display input
    const displayInput = document.getElementById('pocketBalanceDisplay');
    const hiddenInput = document.getElementById('pocketBalance');
    
    // Format on input
    displayInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value === '') value = '0';
        hiddenInput.value = value;
        displayInput.value = parseInt(value).toLocaleString('id-ID');
    });
    
    // Setup calculator button with pre-fill
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.replaceWith(calcBtn.cloneNode(true)); // Remove old listeners
        const newCalcBtn = document.getElementById('calcBtn');
        newCalcBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { Calculator } = await import('../components/Calculator.js');
            const calc = new Calculator();
            const currentValue = parseInt(hiddenInput.value) || 0;
            const result = await calc.show(currentValue); // Pass current value
            if (result !== null) {
                hiddenInput.value = result;
                displayInput.value = result.toLocaleString('id-ID');
            }
        });
    }
    
    // Set active icon/color based on current selection
    setTimeout(() => {
        const currentIcon = document.getElementById('pocketIcon').value;
        const currentColor = document.getElementById('pocketColor').value;
        
        // Highlight active icon
        document.querySelectorAll('.icon-opt').forEach(btn => {
            const iconClass = btn.querySelector('i').className;
            if (iconClass === currentIcon) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Highlight active color
        document.querySelectorAll('.color-opt').forEach(btn => {
            const btnColor = btn.style.background.toUpperCase();
            const targetColor = currentColor.toUpperCase();
            if (btnColor === targetColor || rgbToHex(btnColor) === targetColor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }, 50);
}

// Helper function to convert rgb to hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb.toUpperCase();
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    return '#' + [match[1], match[2], match[3]].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
    window._editId = null;
    // Reset form for next add
    if (!window._editId) {
        document.getElementById('pocketForm').reset();
        document.getElementById('pocketName').value = '';
        document.getElementById('pocketBalance').value = '0';
        document.getElementById('pocketIcon').value = 'fa-solid fa-wallet';
        document.getElementById('pocketColor').value = '#87CEEB';
        document.getElementById('modalTitle').textContent = t('addPocket');
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('pocketName').value;
    const balanceInput = document.getElementById('pocketBalance');
    const balance = balanceInput.value ? Number(balanceInput.value) : 0;
    const icon = document.getElementById('pocketIcon').value;
    const color = document.getElementById('pocketColor').value;
    
    if (!name.trim()) {
        alert('Nama kantong tidak boleh kosong');
        return;
    }
    
    const data = { name, balance, icon, color };
    
    try {
        if (window._editId) {
            await api.updatePocket(window._editId, data);
        } else {
            await api.createPocket(data);
        }
        closeModal();
        await loadPockets();
    } catch (err) {
        console.error('Pocket save error:', err);
        alert('Gagal menyimpan kantong: ' + (err.message || 'Unknown error'));
    }
}
