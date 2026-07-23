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
    register: (email, password, name) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    }),
    getMe: () => request('/auth/me'),

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
};
