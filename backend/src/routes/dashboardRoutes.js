const express = require('express');
const { db } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/response');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const summary = await db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS "totalIncome",
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS "totalExpense",
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS balance
    FROM transactions
    WHERE user_id = ? AND substr(date, 1, 7) = ?
  `).get(req.user.id, currentMonth);

  const categoryBreakdown = await db.prepare(`
    SELECT c.name, SUM(t.amount) AS total
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ? AND t.type = 'expense' AND substr(t.date, 1, 7) = ?
    GROUP BY c.name
    ORDER BY total DESC
  `).all(req.user.id, currentMonth);

  const monthlyEvolution = await db.prepare(`
    SELECT substr(date, 1, 7) as month, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE user_id = ?
    GROUP BY substr(date, 1, 7)
    ORDER BY month ASC
    LIMIT 12
  `).all(req.user.id);

  const lastTransactions = await db.prepare(`
    SELECT t.*, c.name as category_name
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 6
  `).all(req.user.id);

  const goals = await db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);

  const payload = {
    summary: {
      currentBalance: Number(summary.balance || 0),
      monthlyIncome: Number(summary.totalIncome || 0),
      monthlyExpense: Number(summary.totalExpense || 0),
      monthlySavings: Number((summary.totalIncome || 0) - (summary.totalExpense || 0)),
    },
    categoryBreakdown,
    monthlyEvolution,
    lastTransactions,
    goals: goals.map((goal) => ({
      ...goal,
      progress: goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0,
    })),
  };

  return sendSuccess(res, 200, payload);
});

module.exports = router;
