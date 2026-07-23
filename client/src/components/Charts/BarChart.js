import Chart from 'chart.js/auto';

export function BarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => `${d.icon} ${d.name}`),
            datasets: [{
                label: 'Pengeluaran',
                data: data.map(d => d.total),
                backgroundColor: data.map(d => d.color || '#87CEEB'),
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
                }
            }
        }
    });
}
