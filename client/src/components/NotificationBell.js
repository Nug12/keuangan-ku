import { api } from '../api.js';

let notifications = [];

export function NotificationBell() {
    const container = document.createElement('div');
    container.className = 'notification-bell';

    container.innerHTML = `
        <button class="bell-btn" id="bellBtn">
            🔔
            <span class="badge" id="notifBadge" style="display:none">0</span>
        </button>
        <div class="notif-dropdown" id="notifDropdown" style="display:none">
            <div class="notif-header">
                <h4>Notifikasi</h4>
                <button class="btn-link" id="clearAll">Hapus Semua</button>
            </div>
            <div class="notif-list" id="notifList"></div>
        </div>
    `;

    // Event listeners
    container.querySelector('#bellBtn').addEventListener('click', toggleDropdown);
    container.querySelector('#clearAll').addEventListener('click', clearAll);

    // Load notifications
    loadNotifications();

    return container;
}

async function loadNotifications() {
    try {
        notifications = await api.getNotifications();
        updateBadge();
        renderList();
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function updateBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;

    const unread = notifications.filter(n => !n.is_read).length;

    if (unread > 0) {
        badge.style.display = 'block';
        badge.textContent = unread;
    } else {
        badge.style.display = 'none';
    }
}

function renderList() {
    const list = document.getElementById('notifList');
    if (!list) return;

    list.innerHTML = '';

    if (notifications.length === 0) {
        list.innerHTML = '<p class="notif-empty">Tidak ada notifikasi</p>';
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notif-item ${notif.is_read ? '' : 'unread'}`;

        item.innerHTML = `
            <p class="notif-message">${notif.message}</p>
            <p class="notif-time">${new Date(notif.created_at).toLocaleString('id-ID')}</p>
        `;

        item.addEventListener('click', async () => {
            if (!notif.is_read) {
                await api.markRead(notif.id);
                notif.is_read = 1;
                updateBadge();
                item.classList.remove('unread');
            }
        });

        list.appendChild(item);
    });
}

function toggleDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

async function clearAll() {
    for (const notif of notifications) {
        await api.deleteNotification(notif.id);
    }
    notifications = [];
    updateBadge();
    renderList();
}
