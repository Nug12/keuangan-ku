import { api } from '../api.js';
import { PieChart } from '../components/Charts/PieChart.js';
import { LineChart } from '../components/Charts/LineChart.js';
import { BarChart } from '../components/Charts/BarChart.js';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

let charts = [];

export async function renderReports() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="container">
            <nav class="navbar-app">
                <div class="logo"><i class="fa-solid fa-wallet"></i> KeuanganKu</div>
                <div class="nav-links">
                    <a href="#/keuanganku">Dashboard</a>
                    <a href="#/keuanganku/pockets">Kantong</a>
                    <a href="#/keuanganku/transactions">Transaksi</a>
                    <a href="#/keuanganku/budgets">Budget</a>
                    <a href="#/keuanganku/reports" class="active">Laporan</a>
                </div>
                <button class="btn btn-secondary" id="logoutBtn">Keluar</button>
            </nav>

            <div class="page-header">
                <h1><i class="fa-solid fa-chart-line"></i> Laporan</h1>
                <div class="export-buttons">
                    <button class="btn btn-secondary" id="exportPDF"><i class="fa-solid fa-file-pdf"></i> Export PDF</button>
                    <button class="btn btn-secondary" id="exportExcel"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                </div>
            </div>

            <div class="summary-cards" id="summaryCards"></div>

            <div class="charts-grid">
                <div class="card">
                    <h3>Tren Pengeluaran</h3>
                    <div class="chart-container">
                        <canvas id="lineChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Pengeluaran per Kategori</h3>
                    <div class="chart-container">
                        <canvas id="pieChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Pengeluaran per Kantong</h3>
                    <div class="chart-container">
                        <canvas id="barChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Export Modal -->
            <div class="modal" id="exportModal" style="display:none">
                <div class="modal-content">
                    <h2>Export Laporan</h2>
                    <form id="exportForm">
                        <label>Periode</label>
                        <select id="exportPeriod">
                            <option value="monthly">Bulanan</option>
                            <option value="yearly">Tahunan</option>
                            <option value="custom">Custom</option>
                        </select>
                        <div id="customDates" style="display:none">
                            <label>Dari Tanggal</label>
                            <input type="date" id="startDate">
                            <label>Sampai Tanggal</label>
                            <input type="date" id="endDate">
                        </div>
                        <label>Format</label>
                        <select id="exportFormat">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancelExport">Batal</button>
                            <button type="submit" class="btn btn-primary">Download</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Load data
    await loadReports();

    // Event listeners
    document.getElementById('exportPDF').addEventListener('click', () => openExportModal('pdf'));
    document.getElementById('exportExcel').addEventListener('click', () => openExportModal('excel'));
    document.getElementById('cancelExport').addEventListener('click', closeExportModal);
    document.getElementById('exportForm').addEventListener('submit', handleExport);
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
    });

    document.getElementById('exportPeriod').addEventListener('change', (e) => {
        document.getElementById('customDates').style.display =
            e.target.value === 'custom' ? 'block' : 'none';
    });
}

async function loadReports() {
    // Destroy existing charts
    charts.forEach(chart => chart.destroy());
    charts = [];

    const [summary, weekly, byCategory, byPocket] = await Promise.all([
        api.getSummary(),
        api.getWeekly(),
        api.getByCategory(),
        api.getByPocket(),
    ]);

    // Render summary cards
    const summaryCards = document.getElementById('summaryCards');
    summaryCards.innerHTML = `
        <div class="card summary-card">
            <p class="summary-label">Total Saldo</p>
            <p class="summary-value">Rp ${summary.totalBalance.toLocaleString('id-ID')}</p>
        </div>
        <div class="card summary-card income">
            <p class="summary-label">Pemasukan Hari Ini</p>
            <p class="summary-value">+ Rp ${summary.income.toLocaleString('id-ID')}</p>
        </div>
        <div class="card summary-card expense">
            <p class="summary-label">Pengeluaran Hari Ini</p>
            <p class="summary-value">- Rp ${summary.expense.toLocaleString('id-ID')}</p>
        </div>
    `;

    // Render charts
    if (byCategory.length > 0) {
        charts.push(PieChart('pieChart', byCategory));
    }

    charts.push(LineChart('lineChart', weekly));

    if (byPocket.length > 0) {
        charts.push(BarChart('barChart', byPocket));
    }
}

function openExportModal(format) {
    document.getElementById('exportModal').style.display = 'flex';
    document.getElementById('exportFormat').value = format;
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

async function handleExport(e) {
    e.preventDefault();

    const period = document.getElementById('exportPeriod').value;
    const format = document.getElementById('exportFormat').value;

    let startDate, endDate;

    if (period === 'monthly') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (period === 'yearly') {
        const now = new Date();
        startDate = `${now.getFullYear()}-01-01`;
        endDate = `${now.getFullYear()}-12-31`;
    } else {
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;
    }

    const data = await api.getExport({ start_date: startDate, end_date: endDate });

    if (format === 'pdf') {
        exportPDF(data, startDate, endDate);
    } else {
        exportExcel(data, startDate, endDate);
    }

    closeExportModal();
}

function exportPDF(data, startDate, endDate) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Laporan Keuangan', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Periode: ${startDate} - ${endDate}`, 105, 30, { align: 'center' });

    // Table header
    let y = 50;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Tanggal', 20, y);
    doc.text('Tipe', 60, y);
    doc.text('Kategori', 90, y);
    doc.text('Deskripsi', 120, y);
    doc.text('Jumlah', 160, y);

    // Table data
    doc.setFont(undefined, 'normal');
    y += 10;

    data.forEach(txn => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(new Date(txn.created_at).toLocaleDateString('id-ID'), 20, y);
        doc.text(txn.type, 60, y);
        doc.text(txn.category || '-', 90, y);
        doc.text(txn.description || '-', 120, y);
        doc.text(`Rp ${txn.amount.toLocaleString('id-ID')}`, 160, y);

        y += 8;
    });

    // Summary
    y += 10;
    doc.setFont(undefined, 'bold');
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    doc.text('Total Pemasukan:', 20, y);
    doc.text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 160, y);
    y += 8;
    doc.text('Total Pengeluaran:', 20, y);
    doc.text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 160, y);

    doc.save(`laporan-keuangan-${startDate}-${endDate}.pdf`);
}

function exportExcel(data, startDate, endDate) {
    const worksheetData = data.map(txn => ({
        'Tanggal': new Date(txn.created_at).toLocaleDateString('id-ID'),
        'Tipe': txn.type,
        'Kategori': txn.category || '-',
        'Deskripsi': txn.description || '-',
        'Jumlah': txn.amount,
    }));

    // Add summary
    const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    worksheetData.push({});
    worksheetData.push({ 'Tanggal': 'Total Pemasukan', 'Jumlah': totalIncome });
    worksheetData.push({ 'Tanggal': 'Total Pengeluaran', 'Jumlah': totalExpense });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

    XLSX.writeFile(workbook, `laporan-keuangan-${startDate}-${endDate}.xlsx`);
}
