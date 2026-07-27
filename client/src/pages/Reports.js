import { api } from '../api.js';
import { t, getLang, translateCategoryName } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';
import { BarChart } from '../components/Charts/BarChart.js';
import { PieChart } from '../components/Charts/PieChart.js';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

let charts = [];

export async function renderReports() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('reports'));

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div class="page-header">
            <h1><i class="fa-solid fa-chart-pie"></i> ${t('reportsTitle')}</h1>
            <button class="btn btn-primary" id="exportBtn"><i class="fa-solid fa-download"></i> ${t('export')}</button>
        </div>
        <div class="reports-grid">
            <div class="card"><div class="card-header"><div class="card-header-left"><div class="card-icon"><i class="fa-solid fa-chart-bar"></i></div><h2>${t('expensePerPocket')}</h2></div></div><div class="chart-wrap-lg"><canvas id="barChart"></canvas></div></div>
            <div class="card"><div class="card-header"><div class="card-header-left"><div class="card-icon"><i class="fa-solid fa-chart-pie"></i></div><h2>${t('expensePerCategory')}</h2></div></div><div class="chart-wrap-lg"><canvas id="pieChart"></canvas></div></div>
        </div>
        <div class="modal-overlay" id="exportModal" style="display:none"><div class="modal">
            <h2>${t('exportReport')}</h2>
            <form id="exportForm">
                <label>${t('period')}</label>
                <select id="exportPeriod"><option value="month">${t('thisMonth')}</option><option value="year">${t('thisYear')}</option><option value="all">${t('all')}</option><option value="custom">${t('custom')}</option></select>
                <div id="customDates" style="display:none"><label>From</label><input type="date" id="exportFrom"><label>To</label><input type="date" id="exportTo"></div>
                <label>${t('format')}</label>
                <select id="exportFormat"><option value="pdf">PDF</option><option value="excel">Excel</option><option value="csv">CSV</option></select>
                <div style="display:flex;gap:0.5rem;margin-top:1rem">
                    <button type="button" class="btn btn-secondary" id="cancelExport" style="flex:1">${t('cancel')}</button>
                    <button type="submit" class="btn btn-primary" style="flex:1"><i class="fa-solid fa-download"></i> ${t('download')}</button>
                </div>
            </form>
        </div></div>`;
    app.appendChild(content);

    await loadReports();
    document.getElementById('exportBtn').addEventListener('click', () => { document.getElementById('exportModal').style.display = 'flex'; });
    document.getElementById('cancelExport').addEventListener('click', () => { document.getElementById('exportModal').style.display = 'none'; });
    document.getElementById('exportForm').addEventListener('submit', handleExport);
    document.getElementById('exportPeriod').addEventListener('change', (e) => { document.getElementById('customDates').style.display = e.target.value === 'custom' ? 'block' : 'none'; });
}

async function loadReports() {
    charts.forEach(c => c.destroy());
    charts = [];
    try {
        const [byPocket, byCategory] = await Promise.all([api.getByPocket(), api.getByCategory()]);
        if (byPocket?.length && document.getElementById('barChart')) charts.push(BarChart('barChart', byPocket));
        if (byCategory?.length && document.getElementById('pieChart')) charts.push(PieChart('pieChart', byCategory));
    } catch (e) { console.error(e); }
}

async function handleExport(e) {
    e.preventDefault();
    const fmt = document.getElementById('exportFormat').value;
    const isEn = getLang() === 'en';
    const loc = isEn ? 'en-US' : 'id-ID';

    const txns = await api.getTransactions();

    // Map rows with category 'Transfer' for transfer transactions & translated labels
    const formattedRows = txns.map(t => {
        const isTf = t.type === 'transfer';
        const isInc = t.type === 'income';
        
        let typeStr = isTf ? 'Transfer' : isInc ? (isEn ? 'Income' : 'Pemasukan') : (isEn ? 'Expense' : 'Pengeluaran');
        let categoryStr = isTf ? 'Transfer' : (translateCategoryName(t.category) || t.category || (isEn ? 'Others' : 'Lainnya'));
        let dateStr = new Date(t.created_at).toLocaleDateString(loc);
        let descStr = t.description || (isTf ? (isEn ? 'Transfer Between Pockets' : 'Transfer Antar Kantong') : categoryStr);

        if (isEn) {
            return {
                'Date': dateStr,
                'Type': typeStr,
                'Category': categoryStr,
                'Description': descStr,
                'Amount (Rp)': t.amount || 0
            };
        } else {
            return {
                'Tanggal': dateStr,
                'Tipe': typeStr,
                'Kategori': categoryStr,
                'Deskripsi': descStr,
                'Jumlah (Rp)': t.amount || 0
            };
        }
    });

    const fileNameBase = isEn ? 'financial_report' : 'laporan_keuangan';

    if (fmt === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(isEn ? 'KeuanganKu Financial Report' : 'Laporan Keuangan KeuanganKu', 20, 20);
        doc.setFontSize(10);
        
        let y = 35;
        const header = isEn 
            ? 'Date       | Type       | Category    | Description              | Amount'
            : 'Tanggal    | Tipe       | Kategori    | Deskripsi                | Jumlah';
        doc.text(header, 20, y);
        y += 4;
        doc.text('---------------------------------------------------------------------------------', 20, y);
        y += 6;

        formattedRows.slice(0, 35).forEach(r => {
            const date = isEn ? r['Date'] : r['Tanggal'];
            const type = (isEn ? r['Type'] : r['Tipe']).padEnd(10);
            const cat = (isEn ? r['Category'] : r['Kategori']).slice(0,12).padEnd(12);
            const desc = (isEn ? r['Description'] : r['Deskripsi']).slice(0,22).padEnd(22);
            const amt = `Rp ${(isEn ? r['Amount (Rp)'] : r['Jumlah (Rp)']).toLocaleString(loc)}`;

            doc.text(`${date} | ${type} | ${cat} | ${desc} | ${amt}`, 20, y);
            y += 7;
        });

        doc.save(`${fileNameBase}.pdf`);
    } else if (fmt === 'excel') {
        const ws = XLSX.utils.json_to_sheet(formattedRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, isEn ? 'Report' : 'Laporan');
        XLSX.writeFile(wb, `${fileNameBase}.xlsx`);
    } else {
        const keys = isEn 
            ? ['Date', 'Type', 'Category', 'Description', 'Amount (Rp)']
            : ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah (Rp)'];

        const csvHeader = keys.join(',') + '\n';
        const csvRows = formattedRows.map(r => keys.map(k => `"${(r[k] || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        
        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileNameBase}.csv`;
        a.click();
    }
    document.getElementById('exportModal').style.display = 'none';
}
