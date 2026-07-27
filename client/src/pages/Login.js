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
        googleBtn.addEventListener('click', () => {
            renderGoogleLoginModal();
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

// Modal Sign-in Akun Google yang sesuai Tema Aplikasi
function renderGoogleLoginModal() {
    const existingModal = document.getElementById('googleAuthModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'googleAuthModal';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;backdrop-filter:blur(6px)';

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text, #1e293b);width:100%;max-width:440px;border-radius:18px;padding:1.75rem;box-shadow:0 20px 25px -5px rgba(0,0,0,0.3);position:relative;border:1px solid var(--border)">
            <button id="closeGoogleModalBtn" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.3rem;color:var(--text-secondary);cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center">&times;</button>
            
            <div style="text-align:center;margin-bottom:1.5rem">
                <svg style="width:48px;height:48px;margin-bottom:0.5rem" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <h3 style="margin:0;font-size:1.25rem;font-weight:700;color:var(--text)">Masuk dengan Akun Google</h3>
                <p style="margin:0.25rem 0 0 0;font-size:0.83rem;color:var(--text-secondary)">Pilih atau masukkan email Google Anda untuk melanjutkan ke KeuanganKu</p>
            </div>

            <!-- Direct Google Accounts Authorization Popup Button -->
            <button id="directGoogleOAuthBtn" style="width:100%;padding:0.75rem;border-radius:10px;border:1px solid #4285F4;background:rgba(66,133,244,0.1);color:#4285F4;font-weight:600;font-size:0.88rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;margin-bottom:1.25rem;transition:all 0.2s">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Otorisasi Jendela Google (accounts.google.com)
            </button>

            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;color:var(--text-secondary);font-size:0.8rem">
                <div style="flex:1;height:1px;background:var(--border)"></div>
                <span>Atau pilih akun Google cepat</span>
                <div style="flex:1;height:1px;background:var(--border)"></div>
            </div>

            <!-- Quick Account Selector Cards -->
            <div style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.25rem">
                <div class="google-acc-item" data-email="user.google@gmail.com" data-name="Google User" style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.85rem;border-radius:10px;border:1px solid var(--border);background:var(--card-2);cursor:pointer;transition:all 0.2s">
                    <div style="width:34px;height:34px;border-radius:50%;background:#ea4335;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem">G</div>
                    <div style="flex:1">
                        <div style="font-weight:600;font-size:0.85rem;color:var(--text)">Google User</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary)">user.google@gmail.com</div>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="font-size:0.8rem;color:var(--text-secondary)"></i>
                </div>

                <div class="google-acc-item" data-email="budi.santoso@gmail.com" data-name="Budi Santoso" style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 0.85rem;border-radius:10px;border:1px solid var(--border);background:var(--card-2);cursor:pointer;transition:all 0.2s">
                    <div style="width:34px;height:34px;border-radius:50%;background:#4285F4;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem">B</div>
                    <div style="flex:1">
                        <div style="font-weight:600;font-size:0.85rem;color:var(--text)">Budi Santoso</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary)">budi.santoso@gmail.com</div>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="font-size:0.8rem;color:var(--text-secondary)"></i>
                </div>
            </div>

            <!-- Custom Email Form -->
            <form id="customGoogleAuthForm" style="padding-top:1rem;border-top:1px solid var(--border)">
                <label style="display:block;margin-bottom:0.35rem;font-size:0.82rem;font-weight:600;color:var(--text-secondary)">Gunakan Email Google Lain</label>
                <div style="margin-bottom:0.75rem">
                    <input type="email" id="customGoogleEmail" placeholder="nama.anda@gmail.com" required style="width:100%;padding:0.65rem 0.85rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:0.88rem">
                </div>
                <div style="margin-bottom:1rem">
                    <input type="text" id="customGoogleName" placeholder="Nama Lengkap (Opsional)" style="width:100%;padding:0.65rem 0.85rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:0.88rem">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;padding:0.7rem;font-size:0.88rem;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:0.5rem">
                    <i class="fa-solid fa-right-to-bracket"></i> Masuk dengan Google
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeGoogleModalBtn').addEventListener('click', () => modal.remove());

    // OAuth Window Action
    document.getElementById('directGoogleOAuthBtn').addEventListener('click', () => {
        // Trigger Google OAuth window or One-tap GIS prompt
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.prompt();
        }
        window.open('https://accounts.google.com/gsi/select', '_blank', 'width=520,height=630');
    });

    // Function to submit Google login
    const executeGoogleLogin = async (email, name) => {
        try {
            const result = await api.googleLogin({ email, name });
            localStorage.setItem('token', result.token);
            if (result.user) {
                const { store } = await import('../store.js');
                store.setUser(result.user);
                if (result.user.theme) setTheme(result.user.theme);
                if (result.user.language) setLang(result.user.language);

                const isAdmin = result.user.role === 'admin' || (result.user.email || '').toLowerCase() === 'admin@nug12.biz.id';
                modal.remove();
                if (isAdmin) {
                    navigate('/keuanganku/admin');
                    return;
                }
            }
            modal.remove();
            navigate('/keuanganku');
        } catch (err) {
            alert(err.message || 'Login dengan Google gagal');
        }
    };

    // Quick account item click
    modal.querySelectorAll('.google-acc-item').forEach(item => {
        item.addEventListener('click', () => {
            const email = item.dataset.email;
            const name = item.dataset.name;
            executeGoogleLogin(email, name);
        });
    });

    // Custom form submit
    document.getElementById('customGoogleAuthForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('customGoogleEmail').value.trim();
        const name = document.getElementById('customGoogleName').value.trim();
        executeGoogleLogin(email, name);
    });
}
