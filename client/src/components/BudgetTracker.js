export function BudgetTracker(budget, onDelete) {
    const card = document.createElement('div');
    card.className = 'card budget-card';

    const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
    const isWarning = percentage >= 80;
    const isDanger = percentage >= 100;

    card.innerHTML = `
        <div class="budget-header">
            <div class="budget-pocket">
                <span class="pocket-icon">${budget.pocket_icon}</span>
                <span>${budget.pocket_name}</span>
            </div>
            <button class="btn-icon delete-btn">🗑️</button>
        </div>
        <div class="budget-progress">
            <div class="progress-bar ${isDanger ? 'danger' : isWarning ? 'warning' : ''}" style="width: ${percentage}%"></div>
        </div>
        <div class="budget-info">
            <span>Rp ${budget.spent.toLocaleString('id-ID')} / Rp ${budget.amount.toLocaleString('id-ID')}</span>
            <span>${percentage.toFixed(0)}%</span>
        </div>
        <p class="budget-period">${budget.period === 'monthly' ? 'Bulanan' : 'Mingguan'}</p>
    `;

    card.querySelector('.delete-btn').addEventListener('click', () => onDelete(budget.id));

    return card;
}
