import { api } from '../api.js';
import { t, getLang, translateCategoryName } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';

let editingId = null;
let activeFilter = 'all';

export async function renderCategories() {
    const isEn = getLang() === 'en';
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('categories'));

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fa-solid fa-tags"></i> ${t('categoriesTitle')}</h1>
            <button class="btn btn-primary" id="addCategory"><i class="fa-solid fa-plus"></i> ${t('addCategory')}</button>
        </div>
        <div class="card">
            <div class="form-tabs" style="margin-bottom: 1rem;">
                <button class="tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">${t('all')}</button>
                <button class="tab ${activeFilter === 'expense' ? 'active' : ''}" data-filter="expense">${t('expense')}</button>
                <button class="tab ${activeFilter === 'income' ? 'active' : ''}" data-filter="income">${t('income')}</button>
            </div>
            <div id="categoriesList"></div>
        </div>
        <div class="modal-overlay" id="modal" style="display:none">
            <div class="modal">
                <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
                    <h2 id="modalTitle" style="margin:0;font-size:1.15rem;font-weight:700">${t('addCategory')}</h2>
                    <button type="button" id="closeModalCross" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-secondary);padding:0 0.25rem;line-height:1;margin:0">&times;</button>
                </div>
                <form id="catForm">
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('categoryName')}</label>
                        <input type="text" id="catName" placeholder="${isEn ? 'e.g. Food / Salary' : 'Contoh: Makanan / Gaji'}" required style="width:100%">
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('type')}</label>
                        <select id="catType" style="width:100%">
                            <option value="expense">${t('expense')}</option>
                            <option value="income">${t('income')}</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:0.85rem">
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('icon')}</label>
                        <div class="icon-picker" id="catIconPicker"></div>
                    </div>
                    <input type="hidden" id="catIcon" value="fa-solid fa-tag">
                    <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
                        <button type="button" class="btn btn-secondary" id="cancelBtn" style="flex:1;margin-right:0">${t('cancel')}</button>
                        <button type="submit" class="btn btn-primary" style="flex:1;margin-right:0">${t('save')}</button>
                    </div>
                </form>
            </div>
        </div>`;
    app.appendChild(content);

    setupIconPicker();
    await loadCategories();

    // Tab filter listener
    content.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            content.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            loadCategories();
        });
    });

    document.getElementById('addCategory').addEventListener('click', () => { 
        editingId = null; 
        document.getElementById('modalTitle').textContent = t('addCategory'); 
        document.getElementById('catName').value = ''; 
        document.getElementById('catType').value = 'expense'; 
        document.getElementById('catIcon').value = 'fa-solid fa-tag';
        updateActiveIcon('fa-solid fa-tag');
        document.getElementById('modal').style.display = 'flex'; 
    });

    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeModalCross').addEventListener('click', closeModal);
    document.getElementById('catForm').addEventListener('submit', handleSubmit);
}

function setupIconPicker() {
    const icons = [
        'fa-solid fa-tag', 'fa-solid fa-utensils', 'fa-solid fa-car', 'fa-solid fa-cart-shopping',
        'fa-solid fa-file-invoice', 'fa-solid fa-gamepad', 'fa-solid fa-money-bill', 'fa-solid fa-briefcase',
        'fa-solid fa-gift', 'fa-solid fa-heart', 'fa-solid fa-plane', 'fa-solid fa-house',
        'fa-solid fa-heart-pulse', 'fa-solid fa-graduation-cap', 'fa-solid fa-dumbbell', 'fa-solid fa-box',
        'fa-solid fa-laptop-code', 'fa-solid fa-coins', 'fa-solid fa-store', 'fa-solid fa-shirt',
        'fa-solid fa-mobile-screen-button', 'fa-solid fa-film', 'fa-solid fa-charging-station', 'fa-solid fa-shield-halved'
    ];
    const picker = document.getElementById('catIconPicker');
    picker.innerHTML = '';
    icons.forEach(ic => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-opt';
        btn.innerHTML = `<i class="${ic}"></i>`;
        btn.addEventListener('click', (e) => { 
            e.preventDefault();
            picker.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            document.getElementById('catIcon').value = ic; 
        });
        picker.appendChild(btn);
    });
}

function updateActiveIcon(targetIcon) {
    const picker = document.getElementById('catIconPicker');
    if (!picker) return;
    picker.querySelectorAll('.icon-opt').forEach(btn => {
        const iconClass = btn.querySelector('i')?.className;
        if (iconClass === targetIcon) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function loadCategories() {
    const cats = await api.getCategories();
    const list = document.getElementById('categoriesList');
    list.innerHTML = '';

    const isEn = getLang() === 'en';
    const filtered = activeFilter === 'all' ? cats : cats.filter(c => c.type === activeFilter);

    if (filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fa-solid fa-tags" style="font-size:2rem;margin-bottom:0.5rem;display:block"></i>${isEn ? `No categories found (${activeFilter})` : `Belum ada kategori (${activeFilter})`}</div>`;
        return;
    }

    filtered.forEach(c => {
        const isInc = c.type === 'income';
        const row = document.createElement('div');
        row.className = 'list-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.padding = '0.75rem 0';
        row.style.borderBottom = '1px solid var(--border)';

        const typeLabel = isInc ? t('income') : t('expense');
        const typeBg = isInc ? 'rgba(22, 163, 74, 0.15)' : 'rgba(225, 29, 72, 0.15)';
        const typeColor = isInc ? '#16a34a' : '#e11d48';

        row.innerHTML = `
            <div class="list-left" style="display:flex;align-items:center;gap:0.75rem">
                <div class="list-icon" style="background:${typeBg};color:${typeColor};width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem">
                    <i class="${c.icon || 'fa-solid fa-tag'}"></i>
                </div>
                <div>
                    <span class="list-name" style="font-weight:600;display:block">${translateCategoryName(c.name)}</span>
                    <span style="font-size:0.75rem;padding:0.15rem 0.4rem;border-radius:6px;background:${typeBg};color:${typeColor};font-weight:600">${typeLabel}</span>
                </div>
            </div>
            <div class="list-right" style="display:flex;gap:0.4rem">
                <button class="btn-icon-sm edit-cat" data-id="${c.id}" data-name="${c.name}" data-type="${c.type}" data-icon="${c.icon||'fa-solid fa-tag'}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon-sm btn-danger-sm delete-cat" data-id="${c.id}" title="Hapus"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        list.appendChild(row);
    });

    list.querySelectorAll('.edit-cat').forEach(btn => {
        btn.addEventListener('click', () => { 
            editingId = btn.dataset.id; 
            document.getElementById('modalTitle').textContent = t('editCategory'); 
            document.getElementById('catName').value = btn.dataset.name; 
            document.getElementById('catType').value = btn.dataset.type; 
            const icon = btn.dataset.icon || 'fa-solid fa-tag';
            document.getElementById('catIcon').value = icon; 
            updateActiveIcon(icon);
            document.getElementById('modal').style.display = 'flex'; 
        });
    });

    list.querySelectorAll('.delete-cat').forEach(btn => {
        btn.addEventListener('click', async () => { 
            const { showConfirm } = await import('../utils/alerts.js');
            const confirmed = await showConfirm(t('deleteCategoryConfirm'), t('deleteTitle'));
            if (confirmed) { 
                await api.deleteCategory(btn.dataset.id); 
                await loadCategories(); 
            } 
        });
    });
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
    editingId = null; 
}

async function handleSubmit(e) {
    e.preventDefault();
    const data = { 
        name: document.getElementById('catName').value, 
        type: document.getElementById('catType').value, 
        icon: document.getElementById('catIcon').value 
    };
    if (editingId) await api.updateCategory(editingId, data);
    else await api.createCategory(data);
    closeModal(); 
    await loadCategories();
}
