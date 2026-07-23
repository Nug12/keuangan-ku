export const store = {
    user: null,
    pockets: [],
    transactions: [],
    budgets: [],
    notifications: [],

    setUser(user) { this.user = user; },
    setPockets(pockets) { this.pockets = pockets; },
    setTransactions(transactions) { this.transactions = transactions; },
    setBudgets(budgets) { this.budgets = budgets; },
    setNotifications(notifications) { this.notifications = notifications; },
};
