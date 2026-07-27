#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'keuanganku.db');

let db;
try {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
} catch (err) {
    console.error('Database not found:', DB_PATH);
    process.exit(1);
}

const server = new McpServer({
    name: 'keuanganku',
    version: '1.0.0',
});

// Helper: format currency
function fmt(n) {
    return `Rp ${(n || 0).toLocaleString('id-ID')}`;
}

// ========== TOOLS ==========

server.tool(
    'get_summary',
    'Get financial summary: total balance, today income, today expense',
    {},
    async () => {
        const balance = db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM pockets').get();
        const today = new Date().toISOString().slice(0, 10);
        const income = db.prepare(
            "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND DATE(created_at) = ?"
        ).get(today);
        const expense = db.prepare(
            "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND DATE(created_at) = ?"
        ).get(today);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    totalBalance: balance.total,
                    todayIncome: income.total,
                    todayExpense: expense.total,
                    formatted: {
                        totalBalance: fmt(balance.total),
                        todayIncome: fmt(income.total),
                        todayExpense: fmt(expense.total),
                    }
                }, null, 2)
            }]
        };
    }
);

server.tool(
    'get_pockets',
    'List all pockets (wallets/accounts) with balances',
    {},
    async () => {
        const pockets = db.prepare('SELECT * FROM pockets ORDER BY name').all();
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(pockets.map(p => ({
                    id: p.id,
                    name: p.name,
                    icon: p.icon,
                    color: p.color,
                    balance: p.balance,
                    formattedBalance: fmt(p.balance),
                })), null, 2)
            }]
        };
    }
);

server.tool(
    'get_transactions',
    'List recent transactions with optional limit',
    { limit: z.number().optional().describe('Number of transactions to return (default 20)') },
    async ({ limit }) => {
        const n = limit || 20;
        const txns = db.prepare(
            'SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?'
        ).all(n);
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(txns.map(t => ({
                    id: t.id,
                    type: t.type,
                    amount: t.amount,
                    formattedAmount: `${t.type === 'income' ? '+' : '-'} ${fmt(t.amount)}`,
                    category: t.category,
                    description: t.description,
                    pocket_id: t.pocket_id,
                    created_at: t.created_at,
                })), null, 2)
            }]
        };
    }
);

server.tool(
    'get_transactions_by_period',
    'Get transactions filtered by period (today, week, month, year)',
    { period: z.enum(['today', 'week', 'month', 'year']).describe('Time period filter') },
    async ({ period }) => {
        let dateFilter;
        const now = new Date();
        switch (period) {
            case 'today':
                dateFilter = now.toISOString().slice(0, 10);
                break;
            case 'week':
                const weekAgo = new Date(now - 7 * 86400000);
                dateFilter = weekAgo.toISOString().slice(0, 10);
                break;
            case 'month':
                dateFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
                break;
            case 'year':
                dateFilter = `${now.getFullYear()}-01-01`;
                break;
        }
        const txns = db.prepare(
            'SELECT * FROM transactions WHERE DATE(created_at) >= ? ORDER BY created_at DESC'
        ).all(dateFilter);

        const totalIncome = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    period,
                    count: txns.length,
                    totalIncome,
                    totalExpense,
                    net: totalIncome - totalExpense,
                    formatted: {
                        totalIncome: fmt(totalIncome),
                        totalExpense: fmt(totalExpense),
                        net: fmt(totalIncome - totalExpense),
                    },
                    transactions: txns.slice(0, 50).map(t => ({
                        type: t.type,
                        amount: t.amount,
                        category: t.category,
                        description: t.description,
                        created_at: t.created_at,
                    }))
                }, null, 2)
            }]
        };
    }
);

server.tool(
    'get_budgets',
    'List all budgets with spending progress',
    {},
    async () => {
        const budgets = db.prepare(`
            SELECT b.*, p.name as pocket_name, p.icon as pocket_icon
            FROM budgets b
            LEFT JOIN pockets p ON b.pocket_id = p.id
            ORDER BY b.created_at DESC
        `).all();

        const result = budgets.map(b => {
            const spent = db.prepare(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND pocket_id = ? AND DATE(created_at) BETWEEN ? AND ?"
            ).get(b.pocket_id, b.start_date, b.end_date);

            return {
                id: b.id,
                name: b.name,
                amount: b.amount,
                spent: spent.total,
                remaining: b.amount - spent.total,
                percentage: Math.round((spent.total / b.amount) * 100),
                pocket: b.pocket_name,
                period: `${b.start_date} - ${b.end_date}`,
            };
        });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
);

server.tool(
    'get_categories',
    'List all categories',
    {},
    async () => {
        const categories = db.prepare('SELECT * FROM categories ORDER BY type, name').all();
        return {
            content: [{
                type: 'text',
                text: JSON.stringify(categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    icon: c.icon,
                    type: c.type,
                })), null, 2)
            }]
        };
    }
);

server.tool(
    'get_monthly_report',
    'Get monthly income vs expense report',
    { months: z.number().optional().describe('Number of months to include (default 6)') },
    async ({ months }) => {
        const n = months || 6;
        const monthly = db.prepare(`
            SELECT 
                strftime('%Y-%m', created_at) as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE created_at >= date('now', '-' || ? || ' months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month
        `).all(n);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(monthly.map(m => ({
                    month: m.month,
                    income: m.income,
                    expense: m.expense,
                    net: m.income - m.expense,
                    formatted: {
                        income: fmt(m.income),
                        expense: fmt(m.expense),
                        net: fmt(m.income - m.expense),
                    }
                })), null, 2)
            }]
        };
    }
);

server.tool(
    'get_expense_by_category',
    'Get expense breakdown by category for current month',
    {},
    async () => {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const data = db.prepare(`
            SELECT 
                category,
                SUM(amount) as total,
                COUNT(*) as count
            FROM transactions
            WHERE type = 'expense' AND DATE(created_at) >= ?
            GROUP BY category
            ORDER BY total DESC
        `).all(monthStart);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(data.map(d => ({
                    category: d.category || 'Lainnya',
                    total: d.total,
                    count: d.count,
                    formatted: fmt(d.total),
                })), null, 2)
            }]
        };
    }
);

server.tool(
    'create_transaction',
    'Create a new transaction',
    {
        type: z.enum(['income', 'expense']).describe('Transaction type'),
        amount: z.number().positive().describe('Amount in Rupiah'),
        category: z.string().describe('Category name'),
        description: z.string().optional().describe('Transaction description'),
        pocket_id: z.string().describe('Pocket/account ID'),
    },
    async ({ type, amount, category, description, pocket_id }) => {
        const { v4: uuidv4 } = await import('uuid');
        const id = uuidv4();

        db.prepare(
            'INSERT INTO transactions (id, user_id, type, amount, category, description, pocket_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(id, 'demo-user-id', type, amount, category, description || '', pocket_id);

        // Update pocket balance
        const delta = type === 'income' ? amount : -amount;
        db.prepare('UPDATE pockets SET balance = balance + ? WHERE id = ?').run(delta, pocket_id);

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    success: true,
                    id,
                    message: `${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${fmt(amount)} berhasil dicatat`,
                }, null, 2)
            }]
        };
    }
);

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('KeuanganKu MCP Server running on stdio');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
