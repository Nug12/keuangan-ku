import { api } from '../api.js';
import { navigate } from '../router.js';

export function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <div class="auth-container">
                <div class="auth-card">
                    <h1>💰 KeuanganKu</h1>
                    <h2>Masuk</h2>
                    <form id="loginForm">
                        <label>Email</label>
                        <input type="email" id="email" required placeholder="email@example.com">
                        <label>Password</label>
                        <input type="password" id="password" required placeholder="••••••••">
                        <button type="submit" class="btn btn-primary btn-block">Masuk</button>
                    </form>
                    <p class="auth-link">Belum punya akun? <a href="#/register">Daftar</a></p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { token, user } = await api.login(email, password);
        localStorage.setItem('token', token);
        navigate('/app');
    } catch (error) {
        alert('Email atau password salah');
    }
}
