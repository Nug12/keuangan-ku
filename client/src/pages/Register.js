import { api } from '../api.js';
import { navigate } from '../router.js';

export function renderRegister() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <div class="auth-container">
                <div class="auth-card">
                    <h1><i class="fa-solid fa-wallet"></i> KeuanganKu</h1>
                    <h2>Daftar</h2>
                    <form id="registerForm">
                        <label>Nama</label>
                        <input type="text" id="name" required placeholder="Nama Anda">
                        <label>Email</label>
                        <input type="email" id="email" required placeholder="email@example.com">
                        <label>Password</label>
                        <input type="password" id="password" required placeholder="••••••••" minlength="6">
                        <button type="submit" class="btn btn-primary btn-block">Daftar</button>
                    </form>
                    <p class="auth-link">Sudah punya akun? <a href="#/login">Masuk</a></p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { token, user } = await api.register(email, password, name);
        localStorage.setItem('token', token);
        navigate('/keuanganku');
    } catch (error) {
        alert('Gagal mendaftar: ' + error.message);
    }
}
