import { api } from './api.js';
import { store } from './store.js';
import { route, initRouter, navigate } from './router.js';
import { initTheme } from './theme.js';
import { detectLang, setLang } from './i18n.js';
import { showAlert } from './utils/alerts.js';

// Pages
import { renderLogin } from './pages/Login.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderPockets } from './pages/Pockets.js';
import { renderTransactions } from './pages/Transactions.js';
import { renderBudgets } from './pages/Budgets.js';
import { renderReports } from './pages/Reports.js';
import { renderCategories } from './pages/Categories.js';
import { renderSettings } from './pages/Settings.js';
import { renderAdminDashboard } from './pages/AdminDashboard.js';

// Init theme & language
initTheme();
setLang(detectLang());

// Check auth
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Auth guard
function requireAuth(handler, options = {}) {
    return async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        try {
            const user = await api.getMe();
            store.setUser(user);
            if (user.theme) {
                localStorage.setItem('theme', user.theme);
                initTheme();
            }
            if (user.language) {
                setLang(user.language);
            }

            const isAdmin = user.role === 'admin' || (user.email || '').toLowerCase() === 'admin@nug12.biz.id';
            if (isAdmin && options.userOnly) {
                navigate('/keuanganku/admin');
                return;
            }
        } catch (err) {
            console.error('Auth load error:', err);
        }
        await handler();
    };
}

// Real-time server reconnection monitor & background sync
let isServerOnline = true;
setInterval(async () => {
    if (!isAuthenticated()) return;
    try {
        const res = await fetch('/api/health');
        if (res.ok) {
            if (!isServerOnline) {
                // Server recovered after restart! Live refresh active view smoothly
                isServerOnline = true;
                console.log('⚡ Server connection restored! Refreshing view smoothly...');
                const user = await api.getMe();
                store.setUser(user);
                refreshRoute();
            }
        } else {
            isServerOnline = false;
        }
    } catch (e) {
        isServerOnline = false;
    }
}, 3000);

// Routes
route('/login', renderLogin);
route('/keuanganku', requireAuth(renderDashboard, { userOnly: true }));
route('/keuanganku/pockets', requireAuth(renderPockets, { userOnly: true }));
route('/keuanganku/transactions', requireAuth(renderTransactions, { userOnly: true }));
route('/keuanganku/budgets', requireAuth(renderBudgets, { userOnly: true }));
route('/keuanganku/reports', requireAuth(renderReports, { userOnly: true }));
route('/keuanganku/categories', requireAuth(renderCategories, { userOnly: true }));
route('/keuanganku/settings', requireAuth(renderSettings));
route('/keuanganku/admin', requireAuth(renderAdminDashboard));

// Default: redirect based on auth
route('/', () => {
    if (!isAuthenticated()) {
        navigate('/login');
        return;
    }
    const user = store.user || {};
    const isAdmin = user.role === 'admin' || (user.email || '').toLowerCase() === 'admin@nug12.biz.id';
    navigate(isAdmin ? '/keuanganku/admin' : '/keuanganku');
});

// Init
initRouter();
