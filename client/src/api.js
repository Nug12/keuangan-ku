const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearToken();
        window.location.hash = '#/login';
        throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

export const api = {
    // Auth
    login: (email, password) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),
    googleLogin: (data) => request('/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    forgotPassword: (email) => request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),
    resetPassword: (email, token, newPassword) => request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword }),
    }),
    register: (email, password, name) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    }),
    getMe: () => request('/auth/me'),
    getProfile: () => request('/auth/me'),

    // Pockets
    getPockets: () => request('/pockets'),
    createPocket: (data) => request('/pockets', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updatePocket: (id, data) => request(`/pockets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deletePocket: (id) => request(`/pockets/${id}`, {
        method: 'DELETE',
    }),

    // Transactions
    getTransactions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/transactions?${query}`);
    },
    createTransaction: (data) => request('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    transfer: (data) => request('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteTransaction: (id) => request(`/transactions/${id}`, {
        method: 'DELETE',
    }),

    // Budgets
    getBudgets: () => request('/budgets'),
    createBudget: (data) => request('/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateBudget: (id, data) => request(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteBudget: (id) => request(`/budgets/${id}`, {
        method: 'DELETE',
    }),

    // Reports
    getSummary: () => request('/reports/summary'),
    getWeekly: () => request('/reports/weekly'),
    getMonthly: () => request('/reports/monthly'),
    getByCategory: () => request('/reports/by-category'),
    getByPocket: () => request('/reports/by-pocket'),

    // Notifications
    getNotifications: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

    // Categories
    getCategories: () => request('/categories'),
    createCategory: (data) => request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateCategory: (id, data) => request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id) => request(`/categories/${id}`, {
        method: 'DELETE',
    }),

    // Export
    getExport: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/transactions?${query}`);
    },

    // Preferences
    updatePreferences: (data) => request('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    // Admin
    getAdminStats: () => request('/admin/stats'),
    getAdminUsers: () => request('/admin/users'),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    updateUserPassword: (id, newPassword) => request(`/admin/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ newPassword }) }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    sendBroadcastNotification: (data) => request('/admin/broadcast-notification', { method: 'POST', body: JSON.stringify(data) }),
    getAdminBroadcasts: () => request('/admin/broadcasts'),
    deleteAdminBroadcast: (ids) => request('/admin/broadcasts', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    getAdminDemoResetLogs: () => request('/admin/demo-reset-logs'),
    resetDemoDatabase: () => request('/admin/reset-demo', { method: 'POST' }),
};
