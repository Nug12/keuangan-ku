import { api } from '../api.js';
import { store } from '../store.js';
import { t, getLang, setLang } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';
import { getTheme, getColorTheme, setPreviewThemeMode, setPreviewColorTheme, saveThemeSelection, revertToSavedTheme } from '../theme.js';

export async function renderSettings() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('settings'));

    let user = store.user || {};
    try {
        const fetchedUser = await api.getProfile();
        if (fetchedUser) {
            user = fetchedUser;
            store.setUser(fetchedUser);
        }
    } catch (e) {
        console.error('Error loading profile:', e);
    }

    const isEn = getLang() === 'en';
    const userEmail = (user.email || '').toLowerCase();
    const isDemoAccount = userEmail.includes('demo') || userEmail === 'demo@nug12.biz.id' || userEmail === 'demo@keuanganku.com';
    const currentColor = getColorTheme();
    const currentMode = getTheme();

    let isThemeSaved = false;

    // Listener to revert preview if user navigates away without saving theme
    const handleNavigation = () => {
        if (!isThemeSaved) {
            revertToSavedTheme();
        }
        window.removeEventListener('hashchange', handleNavigation);
    };
    window.addEventListener('hashchange', handleNavigation);

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <h1 class="dashboard-title" style="margin-bottom:1.5rem"><i class="fa-solid fa-gear" style="color:var(--primary)"></i> ${t('settingsTitle')}</h1>
        <div class="settings-stack" style="display:flex;flex-direction:column;gap:1.5rem">
            
            <!-- 1. Profile Section -->
            <div class="settings-card card">
                <div class="settings-card-header" style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                    <div class="settings-card-icon" style="width:36px;height:36px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-user"></i></div>
                    <h2 style="margin:0;font-size:1.1rem;font-weight:700">${t('profile')}</h2>
                </div>
                <div class="settings-card-body">
                    <form id="profileForm">
                        <div class="form-group" style="margin-bottom:1rem">
                            <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('name')}</label>
                            <input type="text" id="profileName" value="${user.name || ''}" placeholder="${isEn ? 'Your Name' : 'Nama Anda'}" required style="width:100%">
                        </div>
                        <div class="form-group" style="margin-bottom:1.25rem">
                            <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${t('email')}</label>
                            <input type="email" id="profileEmail" value="${user.email || ''}" readonly disabled title="${isEn ? 'Email address cannot be changed' : 'Alamat email tidak dapat diubah'}" style="width:100%;background:var(--card-2);cursor:not-allowed;opacity:0.85">
                        </div>
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> ${isEn ? 'Save Profile' : 'Simpan Profil'}</button>
                    </form>
                </div>
            </div>
            
            <!-- 2. Password Change Section -->
            <div class="settings-card card">
                <div class="settings-card-header" style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                    <div class="settings-card-icon" style="width:36px;height:36px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-lock"></i></div>
                    <h2 style="margin:0;font-size:1.1rem;font-weight:700">${isEn ? 'Change Password' : 'Ubah Password'}</h2>
                </div>
                <div class="settings-card-body">
                    ${isDemoAccount ? `
                        <div style="padding:1rem;background:rgba(217,119,6,0.12);border:1px solid rgba(217,119,6,0.3);border-radius:10px;color:#d97706;font-weight:600;font-size:0.85rem;display:flex;align-items:center;gap:0.6rem">
                            <i class="fa-solid fa-lock" style="font-size:1.2rem"></i>
                            <div>
                                <div>${isEn ? 'Password modification is locked for Demo account.' : 'Perubahan password dikunci untuk Akun Demo.'}</div>
                                <div style="font-weight:400;font-size:0.78rem;margin-top:0.2rem;color:var(--text-secondary)">${isEn ? 'Database resets every 2 days. Please use this account freely for testing features.' : 'Database direset otomatis setiap 2 hari. Silakan gunakan akun ini untuk pengujian fungsionalitas.'}</div>
                            </div>
                        </div>
                    ` : `
                        <form id="passwordForm">
                            <div class="form-group" style="margin-bottom:0.85rem">
                                <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Current Password' : 'Password Lama'}</label>
                                <input type="password" id="oldPassword" placeholder="${isEn ? 'Enter current password' : 'Masukkan password lama'}" required style="width:100%">
                            </div>
                            <div class="form-group" style="margin-bottom:0.85rem">
                                <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'New Password' : 'Password Baru'}</label>
                                <input type="password" id="newPassword" placeholder="${isEn ? 'Enter new password' : 'Masukkan password baru'}" required style="width:100%">
                            </div>
                            <div class="form-group" style="margin-bottom:1.25rem">
                                <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Confirm New Password' : 'Konfirmasi Password'}</label>
                                <input type="password" id="confirmPassword" placeholder="${isEn ? 'Confirm new password' : 'Konfirmasi password baru'}" required style="width:100%">
                            </div>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-key"></i> ${isEn ? 'Update Password' : 'Ubah Password'}</button>
                        </form>
                    `}
                </div>
            </div>

            <!-- 3. Theme Section (4 Theme Cards + Light/Dark Toggle + Save Button) -->
            <div class="settings-card card">
                <div class="settings-card-header" style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                    <div class="settings-card-icon" style="width:36px;height:36px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-palette"></i></div>
                    <h2 style="margin:0;font-size:1.1rem;font-weight:700">${isEn ? 'Theme' : 'Tema'}</h2>
                </div>
                <div class="settings-card-body">
                    <label style="display:block;margin-bottom:0.6rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">${isEn ? 'Choose Color Theme' : 'Pilih Warna Tema Aplikasi'}</label>
                    
                    <!-- 4 Theme Cards Grid -->
                    <div class="theme-cards-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:0.75rem;margin-bottom:1.25rem">
                        <div class="theme-card ${currentColor === 'ocean' ? 'active' : ''}" data-color="ocean" style="cursor:pointer;padding:0.75rem;border-radius:10px;border:2px solid ${currentColor==='ocean'?'#4a9fba':'var(--border)'};background:var(--card-bg);display:flex;align-items:center;gap:0.6rem">
                            <div style="width:24px;height:24px;border-radius:50%;background:#4a9fba;box-shadow:0 2px 5px rgba(0,0,0,0.15)"></div>
                            <span style="font-size:0.85rem;font-weight:600">Ocean Blue</span>
                        </div>
                        <div class="theme-card ${currentColor === 'emerald' ? 'active' : ''}" data-color="emerald" style="cursor:pointer;padding:0.75rem;border-radius:10px;border:2px solid ${currentColor==='emerald'?'#10b981':'var(--border)'};background:var(--card-bg);display:flex;align-items:center;gap:0.6rem">
                            <div style="width:24px;height:24px;border-radius:50%;background:#10b981;box-shadow:0 2px 5px rgba(0,0,0,0.15)"></div>
                            <span style="font-size:0.85rem;font-weight:600">Emerald Green</span>
                        </div>
                        <div class="theme-card ${currentColor === 'violet' ? 'active' : ''}" data-color="violet" style="cursor:pointer;padding:0.75rem;border-radius:10px;border:2px solid ${currentColor==='violet'?'#8b5cf6':'var(--border)'};background:var(--card-bg);display:flex;align-items:center;gap:0.6rem">
                            <div style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;box-shadow:0 2px 5px rgba(0,0,0,0.15)"></div>
                            <span style="font-size:0.85rem;font-weight:600">Violet Purple</span>
                        </div>
                        <div class="theme-card ${currentColor === 'rose' ? 'active' : ''}" data-color="rose" style="cursor:pointer;padding:0.75rem;border-radius:10px;border:2px solid ${currentColor==='rose'?'#f43f5e':'var(--border)'};background:var(--card-bg);display:flex;align-items:center;gap:0.6rem">
                            <div style="width:24px;height:24px;border-radius:50%;background:#f43f5e;box-shadow:0 2px 5px rgba(0,0,0,0.15)"></div>
                            <span style="font-size:0.85rem;font-weight:600">Rose Pink</span>
                        </div>
                    </div>

                    <!-- Light / Dark Mode Row -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.85rem 1rem;background:var(--border);border-radius:10px;margin-bottom:1.25rem">
                        <div style="display:flex;align-items:center;gap:0.6rem;font-weight:600;font-size:0.9rem">
                            <i class="fa-solid fa-moon" style="color:var(--primary)"></i>
                            <span>${t('darkMode')}</span>
                        </div>
                        <label class="toggle-switch" style="position:relative;display:inline-block;width:46px;height:24px;margin:0">
                            <input type="checkbox" id="darkModeToggle" ${currentMode === 'dark' ? 'checked' : ''}>
                            <span class="slider" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.3s;border-radius:24px"></span>
                        </label>
                    </div>

                    <button type="button" class="btn btn-primary" id="saveAppearanceBtn">
                        <i class="fa-solid fa-floppy-disk"></i> ${isEn ? 'Save Theme' : 'Simpan Tema'}
                    </button>
                </div>
            </div>
            
            <!-- 4. Language Section -->
            <div class="settings-card card">
                <div class="settings-card-header" style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                    <div class="settings-card-icon" style="width:36px;height:36px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-globe"></i></div>
                    <h2 style="margin:0;font-size:1.1rem;font-weight:700">${t('language')}</h2>
                </div>
                <div class="settings-card-body">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <span style="font-size:0.9rem;font-weight:600">${isEn ? 'Application Language' : 'Bahasa Aplikasi'}</span>
                        <select id="langSelect" style="width:160px"><option value="id" ${getLang()==='id'?'selected':''}>Indonesia</option><option value="en" ${getLang()==='en'?'selected':''}>English</option></select>
                    </div>
                </div>
            </div>

            <!-- 5. Backup Data Section (User Only) -->
            ${!isAdmin ? `
            <div class="settings-card card">
                <div class="settings-card-header" style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                    <div class="settings-card-icon" style="width:36px;height:36px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.1rem"><i class="fa-solid fa-database"></i></div>
                    <h2 style="margin:0;font-size:1.1rem;font-weight:700">${isEn ? 'Backup Data' : 'Backup Data'}</h2>
                </div>
                <div class="settings-card-body">
                    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem;line-height:1.45">
                        ${isEn ? 'The <strong>Backup Data</strong> feature downloads a complete backup of your financial account records in <strong>JSON</strong> format — including Pockets, Categories, Transaction History, Budgets, and Profile Settings. You can keep this file as an archive or for data recovery anytime.' : 'Fitur <strong>Backup Data</strong> mengunduh salinan cadangan (backup) lengkap seluruh catatan keuangan Anda dalam format <strong>JSON</strong> — mencakup daftar Kantong, Kategori, Riwayat Transaksi, Target Budget, dan Pengaturan Profil. Anda dapat menyimpan file ini sebagai arsip atau pemulihan data kapan saja.'}
                    </p>
                    <button class="btn btn-primary" id="exportAll"><i class="fa-solid fa-download"></i> ${isEn ? 'Download Backup JSON' : 'Unduh Backup JSON'}</button>
                </div>
            </div>
            ` : ''}
        </div>`;

    app.appendChild(content);

    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const { showAlert } = await import('../utils/alerts.js');
            try {
                const response = await fetch('/api/auth/preferences', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ name, email })
                });
                const data = await response.json();
                if (!response.ok) {
                    await showAlert('Error: ' + (data.error || 'Gagal menyimpan profil'), 'error');
                    return;
                }
                store.setUser(data);
                await showAlert(isEn ? 'Profile updated successfully' : 'Profil berhasil diperbarui', 'success');
            } catch (err) {
                await showAlert('Error: ' + err.message, 'error');
            }
        });
    }

    // Password form submission (for non-demo accounts)
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPwd = document.getElementById('oldPassword').value;
            const newPwd = document.getElementById('newPassword').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            const { showAlert } = await import('../utils/alerts.js');
            
            if (newPwd !== confirmPwd) {
                await showAlert(isEn ? 'New passwords do not match' : 'Password baru tidak cocok', 'warning');
                return;
            }
            if (newPwd.length < 6) {
                await showAlert(isEn ? 'Password must be at least 6 characters' : 'Password minimal 6 karakter', 'warning');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/change-password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
                });
                
                const data = await response.json();
                if (!response.ok) {
                    await showAlert('Error: ' + (data.error || 'Gagal mengubah password'), 'error');
                    return;
                }
                
                await showAlert(isEn ? 'Password changed successfully' : 'Password berhasil diubah', 'success');
                passwordForm.reset();
            } catch (err) {
                await showAlert('Error: ' + err.message, 'error');
            }
        });
    }

    // Interactive Theme Cards Preview Selection
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            const color = card.dataset.color;
            setPreviewColorTheme(color);
            themeCards.forEach(c => {
                c.style.borderColor = 'var(--border)';
                c.classList.remove('active');
            });
            card.style.borderColor = 'var(--primary)';
            card.classList.add('active');
        });
    });

    // Dark mode toggle listener (Preview mode)
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('change', () => {
            setPreviewThemeMode(darkToggle.checked ? 'dark' : 'light');
        });
    }

    // Save Theme Button (Persists preview theme permanently)
    const saveAppearanceBtn = document.getElementById('saveAppearanceBtn');
    if (saveAppearanceBtn) {
        saveAppearanceBtn.addEventListener('click', async () => {
            const color = getColorTheme();
            const mode = getTheme();
            const { showAlert } = await import('../utils/alerts.js');
            try {
                saveThemeSelection(mode, color);
                isThemeSaved = true;
                await fetch('/api/auth/preferences', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ theme: mode, colorTheme: color })
                });
                await showAlert(isEn ? 'Theme saved successfully' : 'Tema berhasil disimpan', 'success');
            } catch (err) {
                await showAlert('Error: ' + err.message, 'error');
            }
        });
    }

    // Language select
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            setLang(e.target.value);
            renderSettings();
        });
    }

    // Export / Backup all data
    const exportBtn = document.getElementById('exportAll');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                const data = await api.getExport();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `keuanganku-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
            } catch (err) {
                const { showAlert } = await import('../utils/alerts.js');
                await showAlert('Error: ' + err.message, 'error');
            }
        });
    }
}
