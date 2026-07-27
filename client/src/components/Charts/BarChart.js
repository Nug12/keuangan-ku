import Chart from 'chart.js/auto';
import { translatePocketName } from '../../i18n.js';

export function BarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const colors = data.map((d, i) => {
        const palette = ['#87CEEB', '#98FB98', '#FFB6C1', '#FFD700', '#B0E0E6', '#DDA0DD'];
        return d.color || palette[i % palette.length];
    });

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => translatePocketName(d.name)),
            datasets: [{
                label: 'Pengeluaran',
                data: data.map(d => d.total),
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' },
                },
                x: {
                    grid: { display: false },
                }
            }
        }
    });
}
