import { api } from '../api.js';
import { navigate } from '../router.js';
import { setTheme, toggleTheme, getTheme } from '../theme.js';
import { t, setLang, getLang, detectLang } from '../i18n.js';

export async function renderLogin() {
    const app = document.getElementById('app');
    const lang = detectLang();
    setLang(lang);

    app.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <div class="auth-left">
                    <div class="auth-illustration">
                        <div class="auth-illust-content">
                            <i class="fa-solid fa-wallet illust-icon"></i>
                            <h2>KeuanganKu</h2>
                            <p>Kelola keuanganmu dengan mudah dan nyaman</p>
                            <ul class="auth-feature-list">
                                <li><i class="fa-solid fa-wallet"></i> Kantong & dompet</li>
                                <li><i class="fa-solid fa-chart-pie"></i> Laporan grafik</li>
                                <li><i class="fa-solid fa-bell"></i> Notifikasi & mode offline</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="auth-right">
                    <div class="auth-top-bar">
                        <button class="auth-toggle" id="themeToggle" title="${getTheme() === 'dark' ? t('lightMode') : t('darkMode')}">
                            <i class="fa-solid ${getTheme() === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                        </button>
                        <button class="auth-toggle" id="langToggle" title="${t('language')}">
                            <span class="lang-label">${getLang() === 'en' ? 'EN' : 'ID'}</span>
                        </button>
                    </div>

                    <div class="auth-form-wrap">
                        <h1 class="auth-title">${t('signIn')}</h1>
                        <p class="auth-subtitle">${t('signInDesc')}</p>

                        <button class="google-btn" id="googleBtn">
                            <svg class="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            ${t('google')}
                        </button>

                        <div class="auth-divider">
                            <span>${t('orContinue')}</span>
                        </div>

                        <form id="loginForm">
                            <div class="input-group">
                                <i class="fa-regular fa-envelope input-icon"></i>
                                <input type="email" id="email" placeholder="${t('email')}" required>
                            </div>
                            <div class="input-group">
                                <i class="fa-solid fa-lock input-icon"></i>
                                <input type="password" id="password" placeholder="${t('password')}" required>
                                <button type="button" class="pwd-toggle" id="pwdToggle" aria-label="show password">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                            <div class="auth-forgot">
                                <a href="#" id="forgotLink">${t('forgotPassword') || 'Lupa password?'}</a>
                            </div>
                            <button type="submit" class="auth-submit-btn">${t('loginBtn')}</button>
                        </form>

                        <p class="auth-demo" id="demoAutoFillBtn" style="cursor:pointer" title="Klik untuk isi email & password demo">Demo: demo@nug12.biz.id / demo1234</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Demo auto fill click
    const demoBtn = document.getElementById('demoAutoFillBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            document.getElementById('email').value = 'demo@nug12.biz.id';
            document.getElementById('password').value = 'demo1234';
        });
    }

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        toggleTheme();
        renderLogin();
    });

    // Language toggle
    document.getElementById('langToggle').addEventListener('click', () => {
        setLang(getLang() === 'en' ? 'id' : 'en');
        renderLogin();
    });

    // Show/hide password
    document.getElementById('pwdToggle').addEventListener('click', () => {
        const pwd = document.getElementById('password');
        const icon = document.querySelector('#pwdToggle i');
        if (pwd.type === 'password') {
            pwd.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            pwd.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // 1. Google Login Handler
    const googleBtn = document.getElementById('googleBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            // Prompt for Google account details or auto login
            const googleEmail = prompt('Masuk dengan Akun Google (Masukkan email Google Anda):', 'user.google@gmail.com');
            if (!googleEmail || !googleEmail.trim()) return;

            const googleName = prompt('Nama Akun Google Anda:', googleEmail.split('@')[0]);

            try {
                const result = await api.googleLogin({
                    email: googleEmail.trim(),
                    name: googleName ? googleName.trim() : ''
                });

                localStorage.setItem('token', result.token);
                if (result.user) {
                    const { store } = await import('../store.js');
                    store.setUser(result.user);
                    if (result.user.theme) setTheme(result.user.theme);
                    if (result.user.language) setLang(result.user.language);

                    const isAdmin = result.user.role === 'admin' || (result.user.email || '').toLowerCase() === 'admin@nug12.biz.id';
                    if (isAdmin) {
                        navigate('/keuanganku/admin');
                        return;
                    }
                }
                navigate('/keuanganku');
            } catch (err) {
                alert(err.message || 'Login dengan Google gagal');
            }
        });
    }

    // 2. Forgot Password Handler
    const forgot = document.getElementById('forgotLink');
    if (forgot) {
        forgot.addEventListener('click', (e) => {
            e.preventDefault();
            renderForgotPasswordModal();
        });
    }

    // Email login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const result = await api.login(email, password);
            localStorage.setItem('token', result.token);
            if (result.user) {
                const { store } = await import('../store.js');
                store.setUser(result.user);
                if (result.user.theme) setTheme(result.user.theme);
                if (result.user.language) setLang(result.user.language);

                const isAdmin = result.user.role === 'admin' || (result.user.email || '').toLowerCase() === 'admin@nug12.biz.id';
                if (isAdmin) {
                    navigate('/keuanganku/admin');
                    return;
                }
            }
            navigate('/keuanganku');
        } catch (err) {
            alert(err.message || 'Login gagal');
        }
    });
}

// Modal Lupa Password (Step 1: Minta Kode Reset -> Step 2: Reset Password)
function renderForgotPasswordModal() {
    const existingModal = document.getElementById('forgotPwdModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'forgotPwdModal';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;backdrop-filter:blur(4px)';
    
    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text, #1e293b);width:100%;max-width:440px;border-radius:16px;padding:1.75rem;box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);position:relative">
            <button id="closeForgotModalBtn" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.2rem;color:var(--text-secondary);cursor:pointer">&times;</button>
            
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
                <div style="width:40px;height:40px;border-radius:12px;background:rgba(59,130,246,0.15);color:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:1.2rem">
                    <i class="fa-solid fa-key"></i>
                </div>
                <div>
                    <h3 style="margin:0;font-size:1.15rem;font-weight:700">Lupa Password</h3>
                    <p style="margin:0;font-size:0.8rem;color:var(--text-secondary)">Masukkan email terdaftar untuk me-reset password</p>
                </div>
            </div>

            <!-- Step 1: Minta Kode -->
            <form id="requestResetForm">
                <div style="margin-bottom:1rem">
                    <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600">Email Terdaftar</label>
                    <input type="email" id="resetEmailInput" placeholder="contoh: emailAnda@gmail.com" required style="width:100%;padding:0.65rem 0.85rem;border-radius:8px;border:1px solid var(--border);font-size:0.9rem">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;padding:0.7rem;font-size:0.9rem;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:0.5rem">
                    <i class="fa-paper-plane fa-solid"></i> Kirim Kode Reset Password
                </button>
            </form>

            <!-- Step 2: Input Kode & Password Baru (Hidden Initially) -->
            <form id="executeResetForm" style="display:none;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
                <div style="background:rgba(16,185,129,0.1);color:#10b981;padding:0.75rem;border-radius:8px;font-size:0.82rem;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem">
                    <i class="fa-solid fa-circle-check"></i>
                    <span id="resetSuccessMsg">Kode reset 6-digit dikirim ke email!</span>
                </div>
                <div style="margin-bottom:0.85rem">
                    <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600">Kode Reset 6-Digit</label>
                    <input type="text" id="resetTokenInput" placeholder="Masukkan 6 angka kode" required style="width:100%;padding:0.65rem 0.85rem;border-radius:8px;border:1px solid var(--border);font-size:0.9rem;letter-spacing:2px;font-weight:700">
                </div>
                <div style="margin-bottom:1.25rem">
                    <label style="display:block;margin-bottom:0.35rem;font-size:0.85rem;font-weight:600">Password Baru</label>
                    <input type="password" id="newPwdInput" placeholder="Minimal 4 karakter" required style="width:100%;padding:0.65rem 0.85rem;border-radius:8px;border:1px solid var(--border);font-size:0.9rem">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;padding:0.7rem;font-size:0.9rem;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:0.5rem">
                    <i class="fa-solid fa-lock"></i> Simpan Password Baru
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeForgotModalBtn').addEventListener('click', () => modal.remove());

    let targetEmail = '';

    // Step 1 Submit
    document.getElementById('requestResetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        targetEmail = document.getElementById('resetEmailInput').value.trim();
        try {
            const res = await api.forgotPassword(targetEmail);
            document.getElementById('requestResetForm').style.display = 'none';
            const execForm = document.getElementById('executeResetForm');
            execForm.style.display = 'block';
            
            // If token returned for testing ease, prefill it!
            if (res.resetToken) {
                document.getElementById('resetTokenInput').value = res.resetToken;
                document.getElementById('resetSuccessMsg').innerHTML = `Kode reset 6-digit untuk <b>${targetEmail}</b> adalah: <b>${res.resetToken}</b>`;
            } else {
                document.getElementById('resetSuccessMsg').innerText = `Kode 6-digit telah dikirim ke ${targetEmail}`;
            }
        } catch (err) {
            alert(err.message || 'Gagal mengirim kode reset password');
        }
    });

    // Step 2 Submit
    document.getElementById('executeResetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('resetTokenInput').value.trim();
        const newPassword = document.getElementById('newPwdInput').value;

        try {
            const res = await api.resetPassword(targetEmail, token, newPassword);
            alert(res.message || 'Password berhasil diubah!');
            modal.remove();
            
            // Auto fill reset email in login form
            const loginEmailInput = document.getElementById('email');
            if (loginEmailInput) loginEmailInput.value = targetEmail;
        } catch (err) {
            alert(err.message || 'Gagal me-reset password');
        }
    });
}
