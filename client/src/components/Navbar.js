import { t, getLang, setLang } from '../i18n.js';
import { getTheme, toggleTheme } from '../theme.js';
import { NotificationBell } from './NotificationBell.js';
import { store } from '../store.js';

export function renderNavbar(activePage) {
    const pages = [
        { key: 'dashboard', hash: '#/keuanganku', id: 'dashboard' },
        { key: 'pockets', hash: '#/keuanganku/pockets', id: 'pockets' },
        { key: 'transactions', hash: '#/keuanganku/transactions', id: 'transactions' },
        { key: 'budgets', hash: '#/keuanganku/budgets', id: 'budgets' },
        { key: 'reports', hash: '#/keuanganku/reports', id: 'reports' },
        { key: 'categories', hash: '#/keuanganku/categories', id: 'categories' },
    ];

    const user = store.user || {};
    const userEmail = (user.email || '').toLowerCase();
    const isDemo = userEmail.includes('demo') || userEmail === 'demo@nug12.biz.id' || userEmail === 'demo@keuanganku.com';
    const isEn = getLang() === 'en';

    const wrapper = document.createElement('div');
    wrapper.className = 'navbar-wrapper';

    if (isDemo) {
        const banner = document.createElement('div');
        banner.className = 'demo-notice-banner';
        banner.style.cssText = 'background:rgba(217, 119, 6, 0.15);border-bottom:1px solid rgba(217, 119, 6, 0.3);color:#d97706;padding:0.45rem 1rem;font-size:0.8rem;font-weight:600;text-align:center;display:flex;align-items:center;justify-content:center;gap:0.5rem';
        banner.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${isEn ? 'Demo Account — Database will be auto-reset every 2 days.' : 'Akun Demo — Database akan direset otomatis setiap 2 hari.'}</span>`;
        wrapper.appendChild(banner);
    }

    const isAdmin = user.role === 'admin' || userEmail === 'admin@nug12.biz.id';

    const navPages = isAdmin ? [
        { label: isEn ? 'Admin Dashboard' : 'Panel Admin', hash: '#/keuanganku/admin', id: 'admin', icon: 'fa-solid fa-user-shield' }
    ] : [
        { label: t('dashboard'), hash: '#/keuanganku', id: 'dashboard' },
        { label: t('pockets'), hash: '#/keuanganku/pockets', id: 'pockets' },
        { label: t('transactions'), hash: '#/keuanganku/transactions', id: 'transactions' },
        { label: t('budgets'), hash: '#/keuanganku/budgets', id: 'budgets' },
        { label: t('reports'), hash: '#/keuanganku/reports', id: 'reports' },
        { label: t('categories'), hash: '#/keuanganku/categories', id: 'categories' },
    ];

    const nav = document.createElement('nav');
    nav.className = 'nav-bar';
    nav.innerHTML = `
        <div class="nav-logo">
            <div class="nav-logo-icon"><i class="fa-solid fa-wallet"></i></div>
            <span class="nav-logo-text">KeuanganKu</span>
        </div>
        <div class="nav-links">
            ${navPages.map(p => `<a href="${p.hash}" class="nav-link ${activePage === p.id ? 'active' : ''}">${p.icon ? `<i class="${p.icon}"></i> ` : ''}${p.label}</a>`).join('')}
        </div>
        <div class="nav-actions">
            ${isAdmin ? `<a href="#/keuanganku/admin" class="nav-icon ${activePage === 'admin' ? 'active' : ''}" title="Admin Panel" style="background:rgba(139,92,246,0.15);color:#8b5cf6"><i class="fa-solid fa-user-shield"></i></a>` : ''}
            <button class="nav-icon" id="themeToggleBtn" title="${getTheme() === 'dark' ? t('lightMode') : t('darkMode')}">
                <i class="fa-solid ${getTheme() === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
            </button>
            <button class="nav-icon" id="langToggleBtn" title="${t('language')}">
                <span class="lang-label">${getLang() === 'en' ? 'EN' : 'ID'}</span>
            </button>
            <div id="notifBell"></div>
            <a href="#/keuanganku/settings" class="nav-icon ${activePage === 'settings' ? 'active' : ''}" title="${t('settings')}"><i class="fa-solid fa-gear"></i></a>
            <button class="nav-icon" id="logoutBtn" title="${t('logout')}"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
    `;

    wrapper.appendChild(nav);

    // Attach events after DOM insert
    setTimeout(() => {
        const themeBtn = document.getElementById('themeToggleBtn');
        const langBtn = document.getElementById('langToggleBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const notifBell = document.getElementById('notifBell');

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                toggleTheme();
                const icon = themeBtn.querySelector('i');
                const newTheme = getTheme();
                icon.className = `fa-solid ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
                themeBtn.title = newTheme === 'dark' ? t('lightMode') : t('darkMode');
                
                fetch('/api/auth/preferences', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ theme: newTheme })
                }).catch(() => {});
                
                document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
                setTimeout(() => {
                    document.documentElement.style.transition = '';
                }, 300);
            });
        }

        if (langBtn) {
            langBtn.addEventListener('click', () => {
                const newLang = getLang() === 'en' ? 'id' : 'en';
                setLang(newLang);
                
                fetch('/api/auth/preferences', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ language: newLang })
                }).catch(() => {});
                
                window.location.reload();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.hash = '#/login';
            });
        }

        if (notifBell) {
            notifBell.appendChild(NotificationBell());
        }
    }, 0);

    return wrapper;
}
