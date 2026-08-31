const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const goals = await db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return sendSuccess(res, 200, goals.map((goal) => ({
    ...goal,
    progress: goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0,
  })));
});

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome da meta deve ter pelo menos 2 caracteres.'),
    body('targetAmount').isFloat({ gt: 0 }).withMessage('Valor da meta deve ser maior que zero.'),
    body('currentAmount').isFloat({ min: 0 }).withMessage('Valor acumulado não pode ser negativo.'),
    body('targetDate').optional({ values: 'null' }).isISO8601().withMessage('Data da meta inválida.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const { name, targetAmount, currentAmount, targetDate } = req.body;
    const result = await db.prepare(
      'INSERT INTO goals (user_id, name, target_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, name.trim(), Number(targetAmount), Number(currentAmount), targetDate || null);

    const goal = await db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
    return sendSuccess(res, 201, { ...goal, progress: goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0 }, 'Meta criada com sucesso.');
  }
);

router.put(
  '/:id',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome da meta deve ter pelo menos 2 caracteres.'),
    body('targetAmount').isFloat({ gt: 0 }).withMessage('Valor da meta deve ser maior que zero.'),
    body('currentAmount').isFloat({ min: 0 }).withMessage('Valor acumulado não pode ser negativo.'),
    body('targetDate').optional({ values: 'null' }).isISO8601().withMessage('Data da meta inválida.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const goal = await db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!goal) {
      return sendError(res, 404, 'Meta não encontrada.');
    }

    const { name, targetAmount, currentAmount, targetDate } = req.body;
    await db.prepare(
      'UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    ).run(name.trim(), Number(targetAmount), Number(currentAmount), targetDate || null, req.params.id, req.user.id);

    const updated = await db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
    return sendSuccess(res, 200, { ...updated, progress: updated.target_amount > 0 ? Math.min((updated.current_amount / updated.target_amount) * 100, 100) : 0 }, 'Meta atualizada com sucesso.');
  }
);

router.delete('/:id', async (req, res) => {
  const goal = await db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!goal) {
    return sendError(res, 404, 'Meta não encontrada.');
  }

  await db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return sendSuccess(res, 200, { id: Number(req.params.id) }, 'Meta excluída com sucesso.');
});

module.exports = router;
