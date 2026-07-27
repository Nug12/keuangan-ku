import { api } from '../api.js';
import { store } from '../store.js';
import { navigate } from '../router.js';
import { t, getLang, translatePocketName, translateCategoryName, translateDescription } from '../i18n.js';
import { renderNavbar } from '../components/Navbar.js';
import { LineChart } from '../components/Charts/LineChart.js';

let lineChartInstance = null;

export async function renderDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(renderNavbar('dashboard'));

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.innerHTML = `
        <div class="page-header" style="margin-bottom:1.25rem">
            <h1><i class="fa-solid fa-house" style="color:var(--primary)"></i> ${t('dashboardTitle')}</h1>
        </div>

        <div id="summaryInsight" class="summary-insight-card" style="margin-bottom:1.25rem"></div>

        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:1rem;margin-bottom:1.5rem">
            <div class="card stat-card" style="display:flex;align-items:center;gap:1rem;padding:1.25rem">
                <div class="stat-icon" style="background:rgba(14,165,233,0.12);color:#0ea5e9;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem"><i class="fa-solid fa-wallet"></i></div>
                <div>
                    <span class="stat-label" style="font-size:0.8rem;color:var(--text-secondary);font-weight:600;display:block">${t('totalBalance')}</span>
                    <h2 id="totalBalance" style="margin:0;font-size:1.4rem;font-weight:700">Rp 0</h2>
                </div>
            </div>
            <div class="card stat-card" style="display:flex;align-items:center;gap:1rem;padding:1.25rem">
                <div class="stat-icon" style="background:rgba(22,163,74,0.12);color:#16a34a;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem"><i class="fa-solid fa-arrow-trend-up"></i></div>
                <div>
                    <span class="stat-label" style="font-size:0.8rem;color:var(--text-secondary);font-weight:600;display:block">${t('todayIncome')}</span>
                    <h2 id="todayIncome" style="margin:0;font-size:1.4rem;font-weight:700;color:#16a34a">Rp 0</h2>
                </div>
            </div>
            <div class="card stat-card" style="display:flex;align-items:center;gap:1rem;padding:1.25rem">
                <div class="stat-icon" style="background:rgba(225,29,72,0.12);color:#e11d48;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem"><i class="fa-solid fa-arrow-trend-down"></i></div>
                <div>
                    <span class="stat-label" style="font-size:0.8rem;color:var(--text-secondary);font-weight:600;display:block">${t('todayExpense')}</span>
                    <h2 id="todayExpense" style="margin:0;font-size:1.4rem;font-weight:700;color:#e11d48">Rp 0</h2>
                </div>
            </div>
        </div>

        <div class="dashboard-grid" style="display:grid;grid-template-columns:1fr 340px;gap:1.25rem;margin-bottom:1.5rem">
            <div class="grid-main" style="display:flex;flex-direction:column;gap:1.25rem">
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                        <div class="card-header-left" style="display:flex;align-items:center;gap:0.6rem">
                            <div class="card-icon" style="width:34px;height:34px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-chart-line"></i></div>
                            <h2 style="margin:0;font-size:1.05rem;font-weight:700">${t('monthlyTransactions')}</h2>
                        </div>
                    </div>
                    <div class="chart-container" style="position:relative;height:240px;width:100%">
                        <canvas id="lineChart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                        <div class="card-header-left" style="display:flex;align-items:center;gap:0.6rem">
                            <div class="card-icon" style="width:34px;height:34px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-clock-rotate-left"></i></div>
                            <h2 style="margin:0;font-size:1.05rem;font-weight:700">${t('lastTransactions')}</h2>
                        </div>
                        <a href="/transactions" class="btn-link" id="txnLink" style="font-size:0.85rem;font-weight:600;color:var(--primary);text-decoration:none">${t('viewAll')} <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                    <div id="recentTransactions"></div>
                </div>
            </div>

            <div class="grid-side" style="display:flex;flex-direction:column;gap:1.25rem">
                <div class="card">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                        <div class="card-header-left" style="display:flex;align-items:center;gap:0.6rem">
                            <div class="card-icon" style="width:34px;height:34px;border-radius:10px;background:rgba(74,159,186,0.15);color:var(--primary);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-wallet"></i></div>
                            <h2 style="margin:0;font-size:1.05rem;font-weight:700">${t('myPockets')}</h2>
                        </div>
                        <a href="/pockets" class="btn-link" id="pocketsLink" style="font-size:0.85rem;font-weight:600;color:var(--primary);text-decoration:none">${t('viewAll')} <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                    <div id="pocketsList"></div>
                </div>
            </div>
        </div>`;
    app.appendChild(content);

    content.querySelector('#pocketsLink').addEventListener('click', (e) => { e.preventDefault(); navigate('/pockets'); });
    content.querySelector('#txnLink').addEventListener('click', (e) => { e.preventDefault(); navigate('/transactions'); });

    await loadDashboard();
}

async function loadDashboard() {
    try {
        const [summary, weekly, pockets, transactions] = await Promise.all([
            api.getSummary(),
            api.getWeekly(),
            api.getPockets(),
            api.getTransactions()
        ]);

        document.getElementById('totalBalance').textContent = `Rp ${(summary.totalBalance || 0).toLocaleString('id-ID')}`;
        document.getElementById('todayIncome').textContent = `Rp ${(summary.income || 0).toLocaleString('id-ID')}`;
        document.getElementById('todayExpense').textContent = `Rp ${(summary.expense || 0).toLocaleString('id-ID')}`;

        // Generate summary insight
        await generateSummaryInsight(transactions, summary);

        if (weekly && weekly.length > 0 && document.getElementById('lineChart')) {
            if (lineChartInstance) lineChartInstance.destroy();
            lineChartInstance = LineChart('lineChart', weekly);
        }

        const pList = document.getElementById('pocketsList');
        pList.innerHTML = '';
        pockets.slice(0, 4).forEach(p => {
            const item = document.createElement('div');
            item.className = 'list-row';
            item.innerHTML = `<div class="list-left"><div class="list-icon" style="background:${p.color}20;color:${p.color}"><i class="${p.icon}"></i></div><span class="list-name">${translatePocketName(p.name)}</span></div><span class="list-value">Rp ${(p.balance||0).toLocaleString('id-ID')}</span>`;
            pList.appendChild(item);
        });

        const tList = document.getElementById('recentTransactions');
        tList.innerHTML = '';
        const isEn = getLang() === 'en';
        const loc = isEn ? 'en-US' : 'id-ID';

        transactions.slice(0, 5).forEach(tx => {
            const item = document.createElement('div');
            item.className = 'list-row';
            const isInc = tx.type === 'income';
            const color = isInc ? '#16a34a' : '#e11d48';
            const bg = isInc ? 'rgba(22, 163, 74, 0.15)' : 'rgba(225, 29, 72, 0.15)';
            const icon = isInc ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down';
            let title = tx.description ? translateDescription(tx.description) : (translateCategoryName(tx.category || '') || tx.type);

            item.innerHTML = `<div class="list-left"><div class="list-icon" style="background:${bg};color:${color}"><i class="${icon}"></i></div><div class="list-info"><span class="list-name" style="font-weight:600">${title}</span><span class="list-sub">${new Date(tx.created_at).toLocaleDateString(loc, {day:'numeric', month:'short'})}</span></div></div><span class="list-value" style="color:${color};font-weight:600">${isInc?'+':'-'} Rp ${(tx.amount||0).toLocaleString(loc)}</span>`;
            tList.appendChild(item);
        });
    } catch (e) { console.error('Dashboard error:', e); }
}

async function generateSummaryInsight(transactions, summary) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Transaksi bulan ini
    const thisMonth = transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });
    
    // Transaksi bulan lalu
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate.getMonth() === lastMonthDate.getMonth() && txDate.getFullYear() === lastMonthDate.getFullYear();
    });
    
    // Hitung total income/expense
    const thisMonthIncome = thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const thisMonthExpense = thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastMonthIncome = lastMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const lastMonthExpense = lastMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Buat insight
    const isEn = getLang() === 'en';
    const loc = isEn ? 'en-US' : 'id-ID';
    let insight = '';
    let icon = '<i class="fa-solid fa-lightbulb"></i>';
    let mood = 'neutral';
    
    const incomeTrend = thisMonthIncome - lastMonthIncome;
    const expenseTrend = thisMonthExpense - lastMonthExpense;
    const balance = summary.totalBalance || 0;
    
    if (thisMonthIncome > 0 && thisMonthExpense > thisMonthIncome * 0.8) {
        // Pengeluaran tinggi
        icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        mood = 'warning';
        insight = isEn
            ? `Balance is getting tight! Monthly expenses reached Rp ${thisMonthExpense.toLocaleString(loc)} (${Math.round((thisMonthExpense/thisMonthIncome)*100)}% of income). Be mindful of spending! <i class="fa-solid fa-hand-fist" style="color:#ef4444"></i>`
            : `Saldo mulai menipis! Pengeluaran bulan ini Rp ${thisMonthExpense.toLocaleString(loc)} (${Math.round((thisMonthExpense/thisMonthIncome)*100)}% dari income). Harus lebih hemat ya! <i class="fa-solid fa-hand-fist" style="color:#ef4444"></i>`;
    } else if (incomeTrend > 0) {
        // Income naik dibanding bulan lalu
        icon = '<i class="fa-solid fa-chart-line"></i>';
        mood = 'positive';
        insight = isEn
            ? `Great savings momentum! <i class="fa-solid fa-piggy-bank" style="color:#10b981"></i> Income grew by Rp ${incomeTrend.toLocaleString(loc)} compared to last month. Keep it up! <i class="fa-solid fa-rocket" style="color:#10b981"></i>`
            : `Ayo semangat menabung! <i class="fa-solid fa-piggy-bank" style="color:#10b981"></i> Income bulan ini naik Rp ${incomeTrend.toLocaleString(loc)} dibanding bulan lalu. Keep it up! <i class="fa-solid fa-rocket" style="color:#10b981"></i>`;
    } else if (expenseTrend < 0) {
        // Expense turun dibanding bulan lalu
        icon = '<i class="fa-solid fa-thumbs-up"></i>';
        mood = 'positive';
        insight = isEn
            ? `Awesome! Expenses dropped by Rp ${Math.abs(expenseTrend).toLocaleString(loc)} this month. Smart lifestyle choices! <i class="fa-solid fa-hands-clapping" style="color:#10b981"></i>`
            : `Mantap! Pengeluaran bulan ini turun Rp ${Math.abs(expenseTrend).toLocaleString(loc)}. Gaya hidup semakin hemat! <i class="fa-solid fa-hands-clapping" style="color:#10b981"></i>`;
    } else if (balance > 0) {
        // Saldo sehat
        icon = '<i class="fa-solid fa-face-smile"></i>';
        mood = 'positive';
        insight = isEn
            ? `Your balance is healthy! Rp ${balance.toLocaleString(loc)}. Maintain balanced spending and keep saving. <i class="fa-solid fa-heart" style="color:#10b981"></i>`
            : `Saldo kamu sehat! Rp ${balance.toLocaleString(loc)}. Pertahankan pengeluaran seimbang dan terus menabung. <i class="fa-solid fa-heart" style="color:#10b981"></i>`;
    } else {
        icon = '<i class="fa-solid fa-chart-column"></i>';
        mood = 'neutral';
        insight = isEn
            ? `Expenses this month Rp ${thisMonthExpense.toLocaleString(loc)}, income Rp ${thisMonthIncome.toLocaleString(loc)}. Keep monitoring your finances! <i class="fa-solid fa-chart-line" style="color:#4A9FBA"></i>`
            : `Pengeluaran bulan ini Rp ${thisMonthExpense.toLocaleString(loc)}, income Rp ${thisMonthIncome.toLocaleString(loc)}. Monitor terus ya! <i class="fa-solid fa-chart-line" style="color:#4A9FBA"></i>`;
    }
    
    const insightCard = document.getElementById('summaryInsight');
    if (!insightCard) return;
    insightCard.innerHTML = `
        <div class="insight-content insight-${mood}">
            <div class="insight-icon">${icon}</div>
            <div class="insight-text">
                <p class="insight-message">${insight}</p>
                <div class="insight-stats">
                    <span><i class="fa-solid fa-arrow-trend-up" style="color:#10b981"></i> ${isEn ? 'Income' : 'Pemasukan'}: Rp ${thisMonthIncome.toLocaleString(loc)}</span>
                    <span>•</span>
                    <span><i class="fa-solid fa-arrow-trend-down" style="color:#ef4444"></i> ${isEn ? 'Expense' : 'Pengeluaran'}: Rp ${thisMonthExpense.toLocaleString(loc)}</span>
                    <span>•</span>
                    <span><i class="fa-solid fa-wallet" style="color:#4A9FBA"></i> ${isEn ? 'Balance' : 'Saldo'}: Rp ${balance.toLocaleString(loc)}</span>
                </div>
            </div>
        </div>
    `;
}
