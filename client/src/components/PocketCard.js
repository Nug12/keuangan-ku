export function PocketCard(pocket, onEdit, onDelete) {
    const card = document.createElement('div');
    card.className = 'card pocket-card';
    card.style.borderLeft = `4px solid ${pocket.color}`;

    card.innerHTML = `
        <div class="pocket-header">
            <span class="pocket-icon">${pocket.icon}</span>
            <div class="pocket-actions">
                <button class="btn-icon edit-btn">✏️</button>
                <button class="btn-icon delete-btn">🗑️</button>
            </div>
        </div>
        <h3>${pocket.name}</h3>
        <p class="pocket-balance">Rp ${pocket.balance.toLocaleString('id-ID')}</p>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => onEdit(pocket));
    card.querySelector('.delete-btn').addEventListener('click', () => onDelete(pocket.id));

    return card;
}
