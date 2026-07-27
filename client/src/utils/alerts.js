// Custom alert modal dengan Ocean Mint theme & theme-aware custom dialogs
export function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'alert-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'alert-modal';
        
        const icon = {
            'success': '✓',
            'error': '✕',
            'warning': '⚠',
            'info': 'ℹ'
        }[type] || 'ℹ';
        
        modal.innerHTML = `
            <div class="alert-icon alert-${type}">${icon}</div>
            <p class="alert-message">${message}</p>
            <button class="alert-btn">OK</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const btn = modal.querySelector('.alert-btn');
        btn.addEventListener('click', () => {
            overlay.remove();
            resolve();
        });
        
        // Close on Escape
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleKeyDown);
                resolve();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    });
}

// Custom confirm modal Ocean Mint theme
export function showConfirm(message, title = 'Konfirmasi') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'alert-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'alert-modal';
        
        modal.innerHTML = `
            <div class="confirm-title">${title}</div>
            <p class="alert-message">${message}</p>
            <div class="confirm-buttons">
                <button class="confirm-btn-cancel">Batal</button>
                <button class="confirm-btn-ok">Ya, Hapus</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const btnCancel = modal.querySelector('.confirm-btn-cancel');
        const btnOk = modal.querySelector('.confirm-btn-ok');
        
        const cleanup = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };
        
        btnCancel.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        btnOk.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        // Close on Escape
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    });
}

// Custom theme-matching Change Password Modal
export function showPasswordPrompt(email, isEn = false) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'alert-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'alert-modal';
        modal.style.maxWidth = '420px';
        modal.style.textAlign = 'left';
        
        modal.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">
                <div style="width:40px;height:40px;border-radius:12px;background:rgba(139,92,246,0.15);color:#8b5cf6;display:flex;align-items:center;justify-content:center;font-size:1.2rem">
                    <i class="fa-solid fa-key"></i>
                </div>
                <div>
                    <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:var(--text)">${isEn ? 'Change User Password' : 'Ubah Password Pengguna'}</h3>
                    <span style="font-size:0.78rem;color:var(--text-secondary);word-break:break-all">${email}</span>
                </div>
            </div>

            <form id="pwdPromptForm">
                <div style="margin-bottom:1.25rem">
                    <label style="display:block;margin-bottom:0.4rem;font-size:0.85rem;font-weight:600;color:var(--text-secondary)">
                        ${isEn ? 'New Password' : 'Password Baru'}
                    </label>
                    <div style="position:relative">
                        <input type="password" id="promptNewPwdInput" placeholder="${isEn ? 'Minimum 4 characters...' : 'Masukkan password baru (min. 4 karakter)...'}" required style="width:100%;padding:0.75rem 2.5rem 0.75rem 0.85rem;border-radius:10px;border:1px solid var(--border);background:var(--card-2);color:var(--text);font-size:0.9rem;font-family:inherit">
                        <button type="button" id="promptPwdToggle" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:0.25rem 0.5rem;font-size:0.9rem">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div style="display:flex;justify-content:flex-end;gap:0.6rem">
                    <button type="button" class="btn btn-secondary prompt-cancel-btn" style="padding:0.5rem 1.25rem;font-size:0.85rem">
                        ${isEn ? 'Cancel' : 'Batal'}
                    </button>
                    <button type="submit" class="btn btn-primary prompt-submit-btn" style="padding:0.5rem 1.25rem;font-size:0.85rem;display:flex;align-items:center;gap:0.4rem">
                        <i class="fa-solid fa-check"></i> ${isEn ? 'Save Password' : 'Simpan Password'}
                    </button>
                </div>
            </form>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const input = modal.querySelector('#promptNewPwdInput');
        const toggleBtn = modal.querySelector('#promptPwdToggle');
        const form = modal.querySelector('#pwdPromptForm');
        const cancelBtn = modal.querySelector('.prompt-cancel-btn');

        setTimeout(() => input.focus(), 100);

        toggleBtn.addEventListener('click', () => {
            const icon = toggleBtn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });

        const cleanup = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeyDown);
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(null);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = input.value.trim();
            cleanup();
            resolve(value);
        });

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    });
}

// Replace global alert dan confirm dengan custom modal
window.alert = function(message) {
    showAlert(message, 'info');
};

window.confirm = function(message) {
    return showConfirm(message, 'Konfirmasi');
};
