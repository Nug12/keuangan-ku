import { api } from '../api.js';
import { getLang } from '../i18n.js';

let notifications = [];

export function NotificationBell() {
    const isEn = getLang() === 'en';
    const container = document.createElement('div');
    container.className = 'notification-bell';

    container.innerHTML = `
        <button class="bell-btn nav-icon-btn" id="bellBtn" title="${isEn ? 'Notifications' : 'Notifikasi'}">
            <i class="fa-solid fa-bell"></i>
            <span class="badge" id="notifBadge" style="display:none">0</span>
        </button>
        <div class="notif-dropdown" id="notifDropdown" style="display:none">
            <div class="notif-header">
                <h4>${isEn ? 'Notifications' : 'Notifikasi'}</h4>
                <button class="btn-link" id="clearAll">${isEn ? 'Clear All' : 'Hapus Semua'}</button>
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

function translateNotificationContent(notif, isEn) {
    let title = notif.title || '';
    let message = notif.message || '';

    if (!isEn) {
        return { title, message };
    }

    // Auto-translate titles
    if (title === 'Pengumuman Sistem') title = 'System Announcement';
    else if (title === 'Budget Melebihi Limit') title = 'Budget Limit Exceeded';
    else if (title === 'Transaksi Baru') title = 'New Transaction';
    else if (title === 'Pembaruan Fitur') title = 'Feature Update';

    // Auto-translate common message phrases
    message = message
        .replace(/Akun Demo — Database akan direset otomatis setiap 2 hari/gi, 'Demo Account — Database will be auto-reset every 2 days')
        .replace(/Anggaran Anda untuk (.+) telah melebihi limit/gi, 'Your budget for $1 has exceeded the limit')
        .replace(/Transaksi baru sebesar (.+) berhasil ditambahkan/gi, 'New transaction of $1 added successfully')
        .replace(/Transfer sebesar (.+) ke kantong (.+) berhasil/gi, 'Transfer of $1 to pocket $2 was successful');

    return { title, message };
}

function renderList() {
    const list = document.getElementById('notifList');
    if (!list) return;

    const isEn = getLang() === 'en';
    list.innerHTML = '';

    if (notifications.length === 0) {
        list.innerHTML = `<p class="notif-empty">${isEn ? 'No notifications' : 'Tidak ada notifikasi'}</p>`;
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notif-item ${notif.is_read ? '' : 'unread'}`;

        const { title, message } = translateNotificationContent(notif, isEn);
        const timeStr = new Date(notif.created_at).toLocaleString(isEn ? 'en-US' : 'id-ID', {
            timeZone: 'Asia/Jayapura',
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        item.innerHTML = `
            ${title ? `<p class="notif-title" style="font-weight:700;font-size:0.85rem;margin:0 0 0.25rem 0;color:var(--text)">${title}</p>` : ''}
            <p class="notif-message" style="margin:0 0 0.35rem 0;font-size:0.82rem;color:var(--text-secondary)">${message}</p>
            <p class="notif-time" style="margin:0;font-size:0.72rem;color:var(--text-secondary);opacity:0.8">${timeStr}</p>
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
