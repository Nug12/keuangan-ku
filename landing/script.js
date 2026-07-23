async function loadApps() {
    const response = await fetch('apps.json');
    const data = await response.json();
    const grid = document.getElementById('appsGrid');

    data.apps.forEach(app => {
        const card = document.createElement('a');
        card.href = app.url;
        card.className = 'app-card';
        card.innerHTML = `
            <div class="icon">${app.icon}</div>
            <h3>${app.name}</h3>
            <p>${app.description}</p>
            <span class="status">${app.status}</span>
        `;
        grid.appendChild(card);
    });
}

loadApps();
