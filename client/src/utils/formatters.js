export function formatRp(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

export function renderIconHtml(iconStr, defaultClass = 'fa-solid fa-wallet') {
    if (!iconStr) return `<i class="${defaultClass}"></i>`;
    if (iconStr.includes('fa-') || iconStr.includes(' ')) {
        return `<i class="${iconStr}"></i>`;
    }
    const map = {
        '💰': 'fa-solid fa-wallet',
        '🐖': 'fa-solid fa-piggy-bank',
        '🛡️': 'fa-solid fa-shield-halved',
        '✈️': 'fa-solid fa-plane',
        '🍔': 'fa-solid fa-utensils',
        '🚗': 'fa-solid fa-car',
        '⚡': 'fa-solid fa-bolt',
        '🎮': 'fa-solid fa-gamepad',
        '🛒': 'fa-solid fa-cart-shopping',
        '💵': 'fa-solid fa-money-bill-wave',
        '🏷️': 'fa-solid fa-tag'
    };
    const mapped = map[iconStr] || defaultClass;
    return `<i class="${mapped}"></i>`;
}
