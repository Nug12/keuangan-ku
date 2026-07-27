import { api } from '../api.js';
import { store } from '../store.js';
import { t, getLang } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';
import { formatRp } from '../utils/formatters.js';

export async function renderAdminDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('admin'));

    const isEn = getLang() === 'en';

    // Pagination state
    let broadcastHistoryData = [];
    let currentBroadcastPage = 1;
    const BROADCAST_PER_PAGE = 5;

    let allUsersData = [];
    let filteredUsersData = [];
    let currentUsersPage = 1;
    const USERS_PER_PAGE = 10;

    let resetLogsData = [];
    let currentResetLogsPage = 1;
    const RESET_LOGS_PER_PAGE = 10;

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
            <div>
                <h1 class="dashboard-title" style="margin:0;display:flex;align-items:center;gap:0.75rem">
                    <span style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, #8b5cf6, #6366f1);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 12px rgba(139,92,246,0.3)">
                        <i class="fa-solid fa-user-shield"></i>
                    </span>
                    ${isEn ? 'Admin Control Dashboard' : 'Dashboard Panel Admin'}
                </h1>
                <p style="margin:0.25rem 0 0 0;font-size:0.85rem;color:var(--text-secondary)">
                    ${isEn ? 'System management for user accounts, global metrics, and broadcast notifications' : 'Manajemen sistem untuk akun pengguna, statistik global, dan pengiriman pemberitahuan global'}
                </p>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem">
                <div style="display:flex;gap:0.75rem">
                    <button class="btn btn-secondary" id="manualResetDemoBtn" style="display:flex;align-items:center;gap:0.5rem;background:rgba(217,119,6,0.12);color:#d97706;border:1px solid rgba(217,119,6,0.3)" title="${isEn ? 'Reset demo account data to initial snapshot' : 'Mengembalikan data akun demo ke kondisi awal'}">
                        <i class="fa-solid fa-rotate-left"></i> ${isEn ? 'Reset Demo DB' : 'Reset Database Demo'}
                    </button>
                    <button class="btn btn-primary" id="refreshAdminBtn" style="display:flex;align-items:center;gap:0.5rem;transition:all 0.2s" title="${isEn ? 'Reloads all user statistics, total transactions, financial volume, broadcast history, and demo reset logs in real-time from server' : 'Memuat ulang seluruh statistik pengguna, total transaksi, volume keuangan, riwayat broadcast, dan log reset database demo secara realtime dari server'}">
                        <i class="fa-solid fa-arrows-rotate"></i> ${isEn ? 'Refresh Data' : 'Segarkan Data'}
                    </button>
                </div>
                <span style="font-size:0.75rem;color:var(--text-secondary);display:flex;align-items:center;gap:0.35rem" id="refreshStatusInfo">
                    <i class="fa-solid fa-circle-info" style="color:var(--primary)"></i> ${isEn ? 'Click to reload all statistics & user data' : 'Klik untuk memuat ulang seluruh statistik & data pengguna'}
                </span>
            </div>
        </div>

        <!-- 1. Stats Overview Cards -->
        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1.25rem;margin-bottom:1.75rem">
            <div class="card stat-card" style="padding:1.25rem;border-radius:16px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                    <span style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Total Registered Users' : 'Total Pengguna Terdaftar'}</span>
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(59,130,246,0.15);color:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-users"></i></div>
                </div>
                <div style="font-size:1.75rem;font-weight:800;color:var(--text)" id="statTotalUsers">...</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.35rem"><i class="fa-solid fa-shield-halved"></i> ${isEn ? 'Includes Admin & Demo Accounts' : 'Termasuk Akun Admin & Demo'}</div>
            </div>

            <div class="card stat-card" style="padding:1.25rem;border-radius:16px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                    <span style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Total Transactions' : 'Total Transaksi'}</span>
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(16,185,129,0.15);color:#10b981;display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-receipt"></i></div>
                </div>
                <div style="font-size:1.75rem;font-weight:800;color:var(--text)" id="statTotalTxns">...</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.35rem"><i class="fa-solid fa-arrow-trend-up"></i> ${isEn ? 'Recorded Income & Expense Entries' : 'Catatan Pemasukan & Pengeluaran'}</div>
            </div>

            <div class="card stat-card" style="padding:1.25rem;border-radius:16px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                    <span style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Financial Volume' : 'Total Volume Keuangan'}</span>
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(139,92,246,0.15);color:#8b5cf6;display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-money-bill-wave"></i></div>
                </div>
                <div style="font-size:1.4rem;font-weight:800;color:var(--primary)" id="statTotalVolume">...</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.35rem"><i class="fa-solid fa-chart-pie"></i> ${isEn ? 'System Financial Turnover' : 'Perputaran Dana Sistem'}</div>
            </div>

            <div class="card stat-card" style="padding:1.25rem;border-radius:16px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
                    <span style="font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Pockets & Budgets' : 'Total Kantong & Budget'}</span>
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(244,63,94,0.15);color:#f43f5e;display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-wallet"></i></div>
                </div>
                <div style="font-size:1.75rem;font-weight:800;color:var(--text)" id="statPocketsBudgets">...</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.35rem"><i class="fa-solid fa-bullseye"></i> ${isEn ? 'Active Fund Allocations' : 'Alokasi Dana Aktif'}</div>
            </div>
        </div>

        <!-- 2. Broadcast Notification Form Section -->
        <div class="card" style="margin-bottom:1.75rem;padding:1.5rem;border-radius:16px">
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                <div style="width:36px;height:36px;border-radius:10px;background:rgba(217,119,6,0.15);color:#d97706;display:flex;align-items:center;justify-content:center;font-size:1.1rem">
                    <i class="fa-solid fa-bullhorn"></i>
                </div>
                <div>
                    <h2 style="margin:0;font-size:1.1rem;font-weight:700">${isEn ? 'Send Global Broadcast Notification' : 'Form Pemberitahuan Global / Broadcast'}</h2>
                    <span style="font-size:0.78rem;color:var(--text-secondary)">${isEn ? 'Send notifications instantly to user accounts (including demo user)' : 'Kirim notifikasi langsung ke Lonceng Pemberitahuan pengguna (termasuk akun demo)'}</span>
                </div>
            </div>
            
            <form id="broadcastForm">
                <div style="display:grid;grid-template-columns:1fr 220px;gap:1rem;margin-bottom:1rem">
                    <div>
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Notification Title' : 'Judul Pemberitahuan'}</label>
                        <input type="text" id="notifTitle" placeholder="${isEn ? 'e.g. System Maintenance / Update Info' : 'Contoh: Info Pembaruan Fitur / Maintenance'}" required style="width:100%">
                    </div>
                    <div>
                        <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Target Recipients' : 'Target Penerima'}</label>
                        <select id="notifTarget" style="width:100%">
                            <option value="all">${isEn ? 'All Users (Including Demo)' : 'Semua Pengguna (Termasuk Demo)'}</option>
                            <option value="demo">${isEn ? 'Demo User Only' : 'Akun Demo Saja'}</option>
                            <option value="regular">${isEn ? 'Regular Registered Users Only' : 'Pengguna Biasa Saja'}</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:1.25rem">
                    <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Notification Message' : 'Isi Pesan Pemberitahuan'}</label>
                    <textarea id="notifMessage" rows="3" placeholder="${isEn ? 'Type message to broadcast to users...' : 'Tuliskan isi pesan pengumuman yang akan diterima pengguna...'}" required style="width:100%;padding:0.75rem;border-radius:10px;border:1px solid var(--border);background:var(--card-2);color:var(--text);font-family:inherit"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:0.6rem">
                    <i class="fa-solid fa-paper-plane"></i> ${isEn ? 'Send Broadcast Notification' : 'Kirim Pemberitahuan Broadcast'}
                </button>
            </form>

            <!-- Broadcast Notification History List (5 per page) -->
            <div style="margin-top:1.75rem;padding-top:1.25rem;border-top:1px solid var(--border)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">
                    <h3 style="font-size:0.95rem;font-weight:700;margin:0;display:flex;align-items:center;gap:0.5rem">
                        <i class="fa-solid fa-list-check" style="color:var(--primary)"></i> ${isEn ? 'Sent Broadcast Notifications History' : 'Daftar Riwayat Pemberitahuan Broadcast'}
                    </h3>
                    <span style="font-size:0.78rem;color:var(--text-secondary)" id="broadcastPageInfo">Page 1 of 1</span>
                </div>
                
                <div id="broadcastHistoryContainer">
                    <div style="text-align:center;padding:1rem;color:var(--text-secondary);font-size:0.85rem"><i class="fa-solid fa-spinner fa-spin"></i> ${isEn ? 'Loading history...' : 'Memuat riwayat pemberitahuan...'}</div>
                </div>

                <div id="broadcastPaginationControls" style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem">
                    <button class="btn btn-secondary" id="broadcastPrevBtn" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem" disabled>
                        <i class="fa-solid fa-chevron-left"></i> ${isEn ? 'Previous' : 'Sebelumnya'}
                    </button>
                    <button class="btn btn-secondary" id="broadcastNextBtn" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem" disabled>
                        ${isEn ? 'Next' : 'Selanjutnya'} <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- 3. User Account Management Table (10 per page with Change Password action) -->
        <div class="card" style="padding:1.5rem;border-radius:16px;margin-bottom:1.75rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:0.5rem">
                <div style="display:flex;align-items:center;gap:0.6rem">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(59,130,246,0.15);color:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:1.1rem">
                        <i class="fa-solid fa-users-gear"></i>
                    </div>
                    <div>
                        <h2 style="margin:0;font-size:1.1rem;font-weight:700">${isEn ? 'User Accounts Management' : 'Manajemen Akun Pengguna'}</h2>
                        <span style="font-size:0.78rem;color:var(--text-secondary)">${isEn ? 'Manage user roles, reset passwords, view stats, and delete accounts' : 'Kelola hak akses role, ubah password, statistik transaksi, dan akun pengguna'}</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.75rem">
                    <input type="text" id="userSearchInput" placeholder="${isEn ? 'Search user email / name...' : 'Cari email / nama user...'}" style="width:220px;padding:0.45rem 0.85rem;border-radius:8px;font-size:0.85rem">
                    <span style="font-size:0.78rem;color:var(--text-secondary)" id="usersPageInfo">Page 1 of 1</span>
                </div>
            </div>

            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.88rem">
                    <thead>
                        <tr style="border-bottom:2px solid var(--border);color:var(--text-secondary)">
                            <th style="padding:0.75rem 1rem">${isEn ? 'User Account' : 'Pengguna'}</th>
                            <th style="padding:0.75rem 1rem">${isEn ? 'Role' : 'Peran (Role)'}</th>
                            <th style="padding:0.75rem 1rem;text-align:center">${isEn ? 'Pockets' : 'Kantong'}</th>
                            <th style="padding:0.75rem 1rem;text-align:center">${isEn ? 'Transactions' : 'Transaksi'}</th>
                            <th style="padding:0.75rem 1rem;text-align:right">${isEn ? 'Total Balance' : 'Total Saldo'}</th>
                            <th style="padding:0.75rem 1rem;text-align:center">${isEn ? 'Actions' : 'Aksi'}</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fa-solid fa-spinner fa-spin"></i> ${isEn ? 'Loading users list...' : 'Memuat daftar pengguna...'}</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="usersPaginationControls" style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem">
                <button class="btn btn-secondary" id="usersPrevBtn" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem" disabled>
                    <i class="fa-solid fa-chevron-left"></i> ${isEn ? 'Previous' : 'Sebelumnya'}
                </button>
                <button class="btn btn-secondary" id="usersNextBtn" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem" disabled>
                    ${isEn ? 'Next' : 'Selanjutnya'} <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- 4. Demo Database Reset Logs Section (Paling Bawah / 10 per page) -->
        <div class="card" style="padding:1.5rem;border-radius:16px;margin-bottom:1.5rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:0.5rem">
                <div style="display:flex;align-items:center;gap:0.6rem">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(217,119,6,0.15);color:#d97706;display:flex;align-items:center;justify-content:center;font-size:1.1rem">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div>
                        <h2 style="margin:0;font-size:1.1rem;font-weight:700">${isEn ? 'Demo Database Reset Logs' : 'Riwayat Log Reset Database Demo'}</h2>
                        <span style="font-size:0.78rem;color:var(--text-secondary)">${isEn ? 'History of automatic 2-day resets and manual admin resets' : 'Catatan riwayat reset otomatis 2 hari sekali dan reset manual admin'}</span>
                    </div>
                </div>
                <span style="font-size:0.78rem;color:var(--text-secondary)" id="resetLogsPageInfo">Page 1 of 1</span>
            </div>

            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;text-align:left;font-size:0.85rem">
                    <thead>
                        <tr style="border-bottom:2px solid var(--border);color:var(--text-secondary)">
                            <th style="padding:0.65rem 0.85rem">${isEn ? 'Reset Date & Time' : 'Tanggal & Waktu Reset'}</th>
                            <th style="padding:0.65rem 0.85rem">${isEn ? 'Trigger Mode' : 'Tipe Trigger'}</th>
                            <th style="padding:0.65rem 0.85rem">${isEn ? 'Status' : 'Status'}</th>
                            <th style="padding:0.65rem 0.85rem">${isEn ? 'Details' : 'Keterangan'}</th>
                        </tr>
                    </thead>
                    <tbody id="resetLogsTableBody">
                        <tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--text-secondary)"><i class="fa-solid fa-spinner fa-spin"></i> ${isEn ? 'Loading reset logs...' : 'Memuat log reset...'}</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="resetLogsPaginationControls" style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem">
                <button class="btn btn-secondary" id="resetLogsPrevBtn" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem" disabled>
                    <i class="fa-solid fa-chevron-left"></i> ${isEn ? 'Previous' : 'Sebelumnya'}
                </button>
                <button class="btn btn-secondary" id="resetLogsNextBtn" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.4rem" disabled>
                    ${isEn ? 'Next' : 'Selanjutnya'} <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    app.appendChild(content);

    async function loadAdminData() {
        try {
            const stats = await api.getAdminStats();
            document.getElementById('statTotalUsers').innerText = stats.totalUsers || 0;
            document.getElementById('statTotalTxns').innerText = stats.totalTransactions || 0;
            document.getElementById('statTotalVolume').innerText = formatRp(stats.totalVolume || 0);
            document.getElementById('statPocketsBudgets').innerText = `${stats.totalPockets || 0} / ${stats.totalBudgets || 0}`;

            allUsersData = await api.getAdminUsers() || [];
            filteredUsersData = [...allUsersData];
            currentUsersPage = 1;
            renderUsersTablePage();
            loadBroadcastHistory();
            loadResetLogs();
        } catch (err) {
            console.error('Error loading admin data:', err);
            const tbody = document.getElementById('usersTableBody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--danger)">Gagal memuat data admin: ${err.message}</td></tr>`;
            }
        }
    }

    // 1. Users Table Pagination (10 per page) & Password Reset Action
    function renderUsersTablePage() {
        const tbody = document.getElementById('usersTableBody');
        const prevBtn = document.getElementById('usersPrevBtn');
        const nextBtn = document.getElementById('usersNextBtn');
        const pageInfo = document.getElementById('usersPageInfo');
        if (!tbody) return;

        const totalItems = filteredUsersData.length;
        const totalPages = Math.ceil(totalItems / USERS_PER_PAGE) || 1;
        if (currentUsersPage > totalPages) currentUsersPage = totalPages;

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)">${isEn ? 'No users found.' : 'Tidak ada pengguna ditemukan.'}</td></tr>`;
            if (pageInfo) pageInfo.innerText = isEn ? 'Page 1 of 1' : 'Halaman 1 dari 1';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        const startIdx = (currentUsersPage - 1) * USERS_PER_PAGE;
        const pageItems = filteredUsersData.slice(startIdx, startIdx + USERS_PER_PAGE);

        tbody.innerHTML = pageItems.map(u => {
            const isAdmin = u.role === 'admin';
            const isPrimaryAdmin = (u.email || '').toLowerCase() === 'admin@nug12.biz.id';
            const isDemo = (u.email || '').toLowerCase() === 'demo@nug12.biz.id' || (u.email || '').toLowerCase() === 'demo@keuanganku.com';

            const isGoogle = u.auth_provider === 'google';

            return `
                <tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:0.85rem 1rem">
                        <div style="display:flex;align-items:center;gap:0.75rem">
                            <div style="width:36px;height:36px;border-radius:50%;background:${isAdmin ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : isGoogle ? 'linear-gradient(135deg, #ea4335, #fbbc05)' : 'var(--card-2)'};color:${isAdmin || isGoogle ? '#fff' : 'var(--primary)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.95rem">
                                ${u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight:700;color:var(--text)">
                                    ${u.name || 'User'} 
                                    ${isDemo ? '<span style="font-size:0.7rem;background:rgba(217,119,6,0.15);color:#d97706;padding:0.15rem 0.4rem;border-radius:4px;margin-left:0.3rem">DEMO</span>' : ''}
                                    ${isGoogle ? '<span style="font-size:0.7rem;background:rgba(234,67,53,0.15);color:#ea4335;padding:0.15rem 0.45rem;border-radius:4px;margin-left:0.3rem;font-weight:700" title="Akun Terhubung Google"><i class="fa-brands fa-google"></i> Google</span>' : ''}
                                </div>
                                <div style="font-size:0.78rem;color:var(--text-secondary)">${u.email}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding:0.85rem 1rem">
                        <span style="font-size:0.75rem;font-weight:700;padding:0.25rem 0.65rem;border-radius:20px;background:${isAdmin ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.12)'};color:${isAdmin ? '#8b5cf6' : '#3b82f6'}">
                            ${isAdmin ? '<i class="fa-solid fa-crown"></i> ADMIN' : '<i class="fa-solid fa-user"></i> USER'}
                        </span>
                    </td>
                    <td style="padding:0.85rem 1rem;text-align:center;font-weight:600">${u.pocket_count || 0}</td>
                    <td style="padding:0.85rem 1rem;text-align:center;font-weight:600">${u.transaction_count || 0}</td>
                    <td style="padding:0.85rem 1rem;text-align:right;font-weight:700;color:var(--primary)">${formatRp(u.total_balance || 0)}</td>
                    <td style="padding:0.85rem 1rem;text-align:center">
                        ${isPrimaryAdmin ? `
                            <span style="font-size:0.75rem;color:var(--text-secondary);font-style:italic"><i class="fa-solid fa-shield"></i> Primary Admin</span>
                        ` : `
                            <div style="display:flex;gap:0.4rem;justify-content:center;flex-wrap:wrap">
                                <button class="btn btn-secondary toggle-role-btn" data-id="${u.id}" data-role="${u.role}" title="${isEn ? 'Toggle Role (Admin/User)' : 'Ubah Role (Admin/User)'}" style="padding:0.35rem 0.6rem;font-size:0.75rem">
                                    <i class="fa-solid fa-user-gear"></i> ${isAdmin ? 'Set User' : 'Set Admin'}
                                </button>
                                <button class="btn btn-secondary change-pwd-btn" data-id="${u.id}" data-email="${u.email}" title="${isEn ? 'Change Password' : 'Ubah Password'}" style="padding:0.35rem 0.6rem;font-size:0.75rem">
                                    <i class="fa-solid fa-key"></i> Password
                                </button>
                                <button class="btn btn-danger delete-user-btn" data-id="${u.id}" data-email="${u.email}" title="${isEn ? 'Delete Account' : 'Hapus Akun Pengguna'}" style="padding:0.35rem 0.6rem;font-size:0.75rem">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        `}
                    </td>
                </tr>
            `;
        }).join('');

        if (pageInfo) pageInfo.innerText = isEn ? `Page ${currentUsersPage} of ${totalPages}` : `Halaman ${currentUsersPage} dari ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentUsersPage <= 1;
        if (nextBtn) nextBtn.disabled = currentUsersPage >= totalPages;

        // Attach action events
        document.querySelectorAll('.toggle-role-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.id;
                const currentRole = btn.dataset.role;
                const newRole = currentRole === 'admin' ? 'user' : 'admin';
                const { showAlert } = await import('../utils/alerts.js');
                try {
                    await api.updateUserRole(userId, newRole);
                    await showAlert(isEn ? `Role updated to ${newRole.toUpperCase()}` : `Role pengguna berhasil diubah ke ${newRole.toUpperCase()}`, 'success');
                    loadAdminData();
                } catch (err) {
                    await showAlert('Error: ' + err.message, 'error');
                }
            });
        });

        document.querySelectorAll('.change-pwd-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.id;
                const email = btn.dataset.email;
                const { showAlert, showPasswordPrompt } = await import('../utils/alerts.js');

                const newPassword = await showPasswordPrompt(email, isEn);
                if (!newPassword) return; // User cancelled
                if (newPassword.trim().length < 4) {
                    await showAlert(isEn ? 'Password must be at least 4 characters' : 'Password minimal harus 4 karakter', 'error');
                    return;
                }

                try {
                    await api.updateUserPassword(userId, newPassword.trim());
                    await showAlert(isEn ? `Password for ${email} updated successfully` : `Password untuk ${email} telah berhasil diperbarui!`, 'success');
                } catch (err) {
                    await showAlert('Error: ' + err.message, 'error');
                }
            });
        });

        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.id;
                const email = btn.dataset.email;
                const { showConfirm, showAlert } = await import('../utils/alerts.js');
                const ok = await showConfirm(isEn ? `Are you sure you want to delete account ${email} and all its data?` : `Apakah Anda yakin ingin menghapus akun ${email} beserta seluruh catatannya?`);
                if (!ok) return;

                try {
                    await api.deleteUser(userId);
                    await showAlert(isEn ? `Account ${email} has been deleted` : `Akun ${email} telah berhasil dihapus`, 'success');
                    loadAdminData();
                } catch (err) {
                    await showAlert('Error: ' + err.message, 'error');
                }
            });
        });
    }

    document.getElementById('usersPrevBtn').addEventListener('click', () => {
        if (currentUsersPage > 1) {
            currentUsersPage--;
            renderUsersTablePage();
        }
    });

    document.getElementById('usersNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredUsersData.length / USERS_PER_PAGE);
        if (currentUsersPage < totalPages) {
            currentUsersPage++;
            renderUsersTablePage();
        }
    });

    // Search filter
    document.getElementById('userSearchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filteredUsersData = allUsersData.filter(u => 
            (u.name || '').toLowerCase().includes(query) || 
            (u.email || '').toLowerCase().includes(query)
        );
        currentUsersPage = 1;
        renderUsersTablePage();
    });

    // 2. Broadcast History Pagination (5 per page)
    async function loadBroadcastHistory() {
        try {
            broadcastHistoryData = await api.getAdminBroadcasts() || [];
            currentBroadcastPage = 1;
            renderBroadcastHistoryPage();
        } catch (err) {
            console.error('Error loading broadcast history:', err);
            const container = document.getElementById('broadcastHistoryContainer');
            if (container) container.innerHTML = `<div style="color:var(--danger);font-size:0.85rem">Error: ${err.message}</div>`;
        }
    }

    function renderBroadcastHistoryPage() {
        const container = document.getElementById('broadcastHistoryContainer');
        const prevBtn = document.getElementById('broadcastPrevBtn');
        const nextBtn = document.getElementById('broadcastNextBtn');
        const pageInfo = document.getElementById('broadcastPageInfo');
        if (!container) return;

        const totalItems = broadcastHistoryData.length;
        const totalPages = Math.ceil(totalItems / BROADCAST_PER_PAGE) || 1;
        if (currentBroadcastPage > totalPages) currentBroadcastPage = totalPages;

        if (totalItems === 0) {
            container.innerHTML = `<div style="text-align:center;padding:1.25rem;color:var(--text-secondary);font-size:0.85rem">${isEn ? 'No broadcast notifications sent yet.' : 'Belum ada riwayat pemberitahuan yang dikirim.'}</div>`;
            if (pageInfo) pageInfo.innerText = isEn ? 'Page 1 of 1' : 'Halaman 1 dari 1';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        const startIdx = (currentBroadcastPage - 1) * BROADCAST_PER_PAGE;
        const pageItems = broadcastHistoryData.slice(startIdx, startIdx + BROADCAST_PER_PAGE);

        container.innerHTML = pageItems.map(b => {
            const dateStr = new Date(b.created_at).toLocaleString(isEn ? 'en-US' : 'id-ID', {
                timeZone: 'Asia/Jayapura',
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            return `
                <div style="background:var(--card-2);border:1px solid var(--border);border-radius:12px;padding:0.9rem 1.1rem;margin-bottom:0.75rem;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem">
                    <div style="flex:1;min-width:260px">
                        <div style="font-weight:700;font-size:0.9rem;color:var(--text);margin-bottom:0.25rem">${b.title}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;line-height:1.4">${b.message}</div>
                        <div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap">
                            <span style="font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:12px;background:rgba(16,185,129,0.15);color:#10b981;font-weight:600">
                                <i class="fa-solid fa-paper-plane"></i> ${isEn ? 'Sent to' : 'Terkirim ke'} ${b.total_sent} ${isEn ? 'users' : 'pengguna'}
                            </span>
                            <span style="font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:12px;background:rgba(59,130,246,0.15);color:#3b82f6;font-weight:600">
                                <i class="fa-solid fa-envelope-open"></i> ${b.total_read} ${isEn ? 'read' : 'sudah dibaca'}
                            </span>
                            <span style="font-size:0.72rem;color:var(--text-secondary);margin-left:0.2rem"><i class="fa-solid fa-clock"></i> ${dateStr}</span>
                        </div>
                    </div>
                    <button class="btn btn-danger delete-broadcast-btn" data-ids="${b.notif_ids}" style="padding:0.4rem 0.75rem;font-size:0.75rem;display:flex;align-items:center;gap:0.4rem">
                        <i class="fa-solid fa-trash"></i> ${isEn ? 'Delete Notification' : 'Hapus Pemberitahuan'}
                    </button>
                </div>
            `;
        }).join('');

        if (pageInfo) pageInfo.innerText = isEn ? `Page ${currentBroadcastPage} of ${totalPages}` : `Halaman ${currentBroadcastPage} dari ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentBroadcastPage <= 1;
        if (nextBtn) nextBtn.disabled = currentBroadcastPage >= totalPages;

        // Delete broadcast listener
        container.querySelectorAll('.delete-broadcast-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const ids = btn.dataset.ids;
                const { showConfirm, showAlert } = await import('../utils/alerts.js');
                const ok = await showConfirm(isEn ? 'Delete this broadcast notification entry?' : 'Hapus pemberitahuan broadcast ini?');
                if (!ok) return;

                try {
                    await api.deleteAdminBroadcast(ids);
                    await showAlert(isEn ? 'Notification deleted successfully' : 'Pemberitahuan berhasil dihapus', 'success');
                    loadBroadcastHistory();
                } catch (err) {
                    await showAlert('Error: ' + err.message, 'error');
                }
            });
        });
    }

    document.getElementById('broadcastPrevBtn').addEventListener('click', () => {
        if (currentBroadcastPage > 1) {
            currentBroadcastPage--;
            renderBroadcastHistoryPage();
        }
    });

    document.getElementById('broadcastNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(broadcastHistoryData.length / BROADCAST_PER_PAGE);
        if (currentBroadcastPage < totalPages) {
            currentBroadcastPage++;
            renderBroadcastHistoryPage();
        }
    });

    // 3. Demo Reset Logs Pagination (10 per page)
    async function loadResetLogs() {
        try {
            resetLogsData = await api.getAdminDemoResetLogs() || [];
            currentResetLogsPage = 1;
            renderResetLogsPage();
        } catch (err) {
            console.error('Error loading reset logs:', err);
            const tbody = document.getElementById('resetLogsTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--danger)">Error: ${err.message}</td></tr>`;
        }
    }

    function renderResetLogsPage() {
        const tbody = document.getElementById('resetLogsTableBody');
        const prevBtn = document.getElementById('resetLogsPrevBtn');
        const nextBtn = document.getElementById('resetLogsNextBtn');
        const pageInfo = document.getElementById('resetLogsPageInfo');
        if (!tbody) return;

        const totalItems = resetLogsData.length;
        const totalPages = Math.ceil(totalItems / RESET_LOGS_PER_PAGE) || 1;
        if (currentResetLogsPage > totalPages) currentResetLogsPage = totalPages;

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--text-secondary)">${isEn ? 'No demo reset logs recorded yet.' : 'Belum ada catatan log reset database demo.'}</td></tr>`;
            if (pageInfo) pageInfo.innerText = isEn ? 'Page 1 of 1' : 'Halaman 1 dari 1';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        const startIdx = (currentResetLogsPage - 1) * RESET_LOGS_PER_PAGE;
        const pageItems = resetLogsData.slice(startIdx, startIdx + RESET_LOGS_PER_PAGE);

        tbody.innerHTML = pageItems.map(l => {
            const isManual = l.trigger_type === 'manual';
            const isSuccess = l.status === 'success';
            const dateStr = new Date(l.created_at).toLocaleString(isEn ? 'en-US' : 'id-ID', {
                timeZone: 'Asia/Jayapura',
                dateStyle: 'medium',
                timeStyle: 'medium'
            });

            return `
                <tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:0.75rem 0.85rem;font-weight:600;color:var(--text)">
                        <i class="fa-solid fa-calendar-day" style="color:var(--text-secondary);margin-right:0.4rem"></i> ${dateStr}
                    </td>
                    <td style="padding:0.75rem 0.85rem">
                        <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.55rem;border-radius:12px;background:${isManual ? 'rgba(217,119,6,0.15)' : 'rgba(59,130,246,0.12)'};color:${isManual ? '#d97706' : '#3b82f6'}">
                            ${isManual ? '<i class="fa-solid fa-user-gear"></i> Manual Admin' : '<i class="fa-solid fa-robot"></i> Otomatis (2 Hari)'}
                        </span>
                    </td>
                    <td style="padding:0.75rem 0.85rem">
                        <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.55rem;border-radius:12px;background:${isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'};color:${isSuccess ? '#10b981' : '#f43f5e'}">
                            ${isSuccess ? '<i class="fa-solid fa-circle-check"></i> Berhasil' : '<i class="fa-solid fa-circle-xmark"></i> Gagal'}
                        </span>
                    </td>
                    <td style="padding:0.75rem 0.85rem;color:var(--text-secondary)">${l.details || '-'}</td>
                </tr>
            `;
        }).join('');

        if (pageInfo) pageInfo.innerText = isEn ? `Page ${currentResetLogsPage} of ${totalPages}` : `Halaman ${currentResetLogsPage} dari ${totalPages}`;
        if (prevBtn) prevBtn.disabled = currentResetLogsPage <= 1;
        if (nextBtn) nextBtn.disabled = currentResetLogsPage >= totalPages;
    }

    document.getElementById('resetLogsPrevBtn').addEventListener('click', () => {
        if (currentResetLogsPage > 1) {
            currentResetLogsPage--;
            renderResetLogsPage();
        }
    });

    document.getElementById('resetLogsNextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(resetLogsData.length / RESET_LOGS_PER_PAGE);
        if (currentResetLogsPage < totalPages) {
            currentResetLogsPage++;
            renderResetLogsPage();
        }
    });

    // Refresh button with loading feedback & status update
    const refreshBtn = document.getElementById('refreshAdminBtn');
    const refreshInfo = document.getElementById('refreshStatusInfo');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${isEn ? 'Refreshing...' : 'Menyegarkan...'}`;
            if (refreshInfo) {
                refreshInfo.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--primary)"></i> ${isEn ? 'Fetching latest data from server...' : 'Sedang mengambil data terbaru dari server...'}`;
            }

            const startTime = Date.now();
            await loadAdminData();
            const elapsedTime = Date.now() - startTime;
            const delay = Math.max(0, 400 - elapsedTime);
            await new Promise(r => setTimeout(r, delay));

            refreshBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${isEn ? 'Updated!' : 'Tersegar!'}`;
            refreshBtn.style.background = '#10b981';
            refreshBtn.style.borderColor = '#10b981';

            const timeStr = new Date().toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { timeZone: 'Asia/Jayapura', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (refreshInfo) {
                refreshInfo.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981"></i> ${isEn ? 'Data successfully refreshed at' : 'Data berhasil diperbarui pada'} ${timeStr}`;
            }

            setTimeout(() => {
                refreshBtn.disabled = false;
                refreshBtn.style.background = '';
                refreshBtn.style.borderColor = '';
                refreshBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> ${isEn ? 'Refresh Data' : 'Segarkan Data'}`;
            }, 2000);
        });
    }

    // Manual reset demo database button
    document.getElementById('manualResetDemoBtn').addEventListener('click', async () => {
        const { showConfirm, showAlert } = await import('../utils/alerts.js');
        const ok = await showConfirm(isEn ? 'Reset demo account database to initial snapshot state?' : 'Reset database akun demo kembali ke kondisi snapshot awal?');
        if (!ok) return;

        try {
            await api.resetDemoDatabase();
            await showAlert(isEn ? 'Demo database reset successfully' : 'Database akun demo berhasil direset ke kondisi awal', 'success');
            loadAdminData();
        } catch (err) {
            await showAlert('Error: ' + err.message, 'error');
        }
    });

    // Broadcast Notification form submission
    document.getElementById('broadcastForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('notifTitle').value;
        const message = document.getElementById('notifMessage').value;
        const target = document.getElementById('notifTarget').value;
        const { showAlert } = await import('../utils/alerts.js');

        try {
            const res = await api.sendBroadcastNotification({ title, message, target });
            await showAlert(`✓ ${res.message}`, 'success');
            document.getElementById('broadcastForm').reset();
            loadBroadcastHistory();
        } catch (err) {
            await showAlert('Error: ' + err.message, 'error');
        }
    });

    // Initial load
    loadAdminData();
}
