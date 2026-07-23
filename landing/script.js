async function loadApps() {
    const response = await fetch('apps.json');
    const data = await response.json();
    const grid = document.getElementById('appsGrid');

    data.apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';

        let demoHTML = '';
        if (app.demo) {
            demoHTML = `
                <div class="demo-box">
                    <div class="demo-label"><i class="fa-solid fa-key"></i> Demo</div>
                    <div class="demo-row">
                        <span class="demo-key">Username</span>
                        <span class="demo-val" onclick="copyText(this)">${app.demo.username}</span>
                    </div>
                    <div class="demo-row">
                        <span class="demo-key">Password</span>
                        <span class="demo-val" onclick="copyText(this)">${app.demo.password}</span>
                    </div>
                    <div class="demo-hint"><i class="fa-regular fa-copy"></i> Klik untuk salin</div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="icon-box" style="background:${app.color}20; color:${app.color}">
                    <i class="${app.icon}"></i>
                </div>
                <span class="status">${app.status}</span>
            </div>
            <h3>${app.name}</h3>
            <p>${app.description}</p>
            ${demoHTML}
            <a href="${app.url}" class="btn-open" style="background:${app.color}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Aplikasi
            </a>
        `;
        grid.appendChild(card);
    });
}

function copyText(el) {
    navigator.clipboard.writeText(el.textContent).then(() => {
        el.classList.add('copied');
        setTimeout(() => el.classList.remove('copied'), 1500);
    });
}

loadApps();
