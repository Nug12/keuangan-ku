import Chart from 'chart.js/auto';
import { translateCategoryName } from '../../i18n.js';

export function PieChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const colors = [
        '#87CEEB', '#98FB98', '#FFB6C1', '#FFD700',
        '#90EE90', '#B0E0E6', '#DDA0DD', '#F0E68C'
    ];

    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => translateCategoryName(d.category || d.name)),
            datasets: [{
                data: data.map(d => d.total),
                backgroundColor: colors.slice(0, data.length),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}
