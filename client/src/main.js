import { api } from './api.js';
import { store } from './store.js';
import { route, initRouter, navigate } from './router.js';

// Pages
import { renderLogin } from './pages/Login.js';
import { renderRegister } from './pages/Register.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderPockets } from './pages/Pockets.js';
import { renderTransactions } from './pages/Transactions.js';
import { renderBudgets } from './pages/Budgets.js';
import { renderReports } from './pages/Reports.js';

// Check auth
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Auth guard
function requireAuth(handler) {
    return async () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        await handler();
    };
}

// Routes
route('/login', renderLogin);
route('/register', renderRegister);
route('/app', requireAuth(renderDashboard));
route('/app/pockets', requireAuth(renderPockets));
route('/app/transactions', requireAuth(renderTransactions));
route('/app/budgets', requireAuth(renderBudgets));
route('/app/reports', requireAuth(renderReports));

// Init
initRouter();
