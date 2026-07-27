async function loadApps() {
    const response = await fetch('apps.json');
    const data = await response.json();
    const grid = document.getElementById('appsGrid');
    const lang = document.documentElement.getAttribute('data-lang') || 'id';

    grid.innerHTML = ''; // Clear previous apps

    data.apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.setAttribute('data-app-name', app.name);

        let demoHTML = '';
        if (app.demo) {
            const demoLabel = lang === 'id' ? 'Demo' : 'Demo';
            const usernameLabel = lang === 'id' ? 'Username' : 'Username';
            const passwordLabel = lang === 'id' ? 'Password' : 'Password';
            const copyHint = lang === 'id' ? 'Klik untuk salin' : 'Click to copy';
            
            demoHTML = `
                <div class="demo-box">
                    <div class="demo-label"><i class="fa-solid fa-key"></i> ${demoLabel}</div>
                    <div class="demo-row">
                        <span class="demo-key">${usernameLabel}</span>
                        <span class="demo-val" onclick="copyText(this)">${app.demo.username}</span>
                    </div>
                    <div class="demo-row">
                        <span class="demo-key">${passwordLabel}</span>
                        <span class="demo-val" onclick="copyText(this)">${app.demo.password}</span>
                    </div>
                    <div class="demo-hint"><i class="fa-regular fa-copy"></i> ${copyHint}</div>
                </div>
            `;
        }

        const btnText = lang === 'id' ? 'Buka Aplikasi' : 'Open App';
        const desc = lang === 'id' ? app.description : app.description_en;

        card.innerHTML = `
            <div class="card-header">
                <div class="icon-box" style="background:${app.color}20; color:${app.color}">
                    <i class="${app.icon}"></i>
                </div>
                <span class="status">${app.status}</span>
            </div>
            <h3 data-text-id="${app.name}" data-text-en="${app.name}">${app.name}</h3>
            <p data-text-id="${app.description}" data-text-en="${app.description_en}">${desc}</p>
            ${demoHTML}
            <a href="${app.url}" class="btn-open" data-btn-demo style="background:${app.color}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> ${btnText}
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

// Listen for language change
document.addEventListener('languageChanged', () => {
    loadApps();
});

// Wait for language to be initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadApps, 100);
    });
} else {
    setTimeout(loadApps, 100);
}
