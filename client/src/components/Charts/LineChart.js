import Chart from 'chart.js/auto';

export function LineChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date || d.month),
            datasets: [
                {
                    label: 'Pemasukan',
                    data: data.map(d => d.income),
                    borderColor: '#90EE90',
                    backgroundColor: 'rgba(144, 238, 144, 0.2)',
                    fill: true,
                },
                {
                    label: 'Pengeluaran',
                    data: data.map(d => d.expense),
                    borderColor: '#FFB6C1',
                    backgroundColor: 'rgba(255, 182, 193, 0.2)',
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
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
