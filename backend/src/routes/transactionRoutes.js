const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { type, categoryId, search, startDate, endDate, minAmount, maxAmount } = req.query;

  let query = 'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.user_id = ?';
  const params = [req.user.id];

  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }

  if (categoryId) {
    query += ' AND t.category_id = ?';
    params.push(Number(categoryId));
  }

  if (startDate) {
    query += ' AND t.date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND t.date <= ?';
    params.push(endDate);
  }

  if (minAmount) {
    query += ' AND t.amount >= ?';
    params.push(Number(minAmount));
  }

  if (maxAmount) {
    query += ' AND t.amount <= ?';
    params.push(Number(maxAmount));
  }

  if (search) {
    query += ' AND (t.description LIKE ? OR t.notes LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ' ORDER BY t.date DESC, t.created_at DESC';

  const transactions = db.prepare(query).all(...params);
  return sendSuccess(res, 200, transactions);
});

router.post(
  '/',
  [
    body('description').trim().isLength({ min: 2 }).withMessage('Descrição deve ter pelo menos 2 caracteres.'),
    body('amount').isFloat({ gt: 0 }).withMessage('Valor deve ser maior que zero.'),
    body('type').isIn(['income', 'expense']).withMessage('Tipo inválido.'),
    body('date').isISO8601().withMessage('Data inválida.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const { description, amount, type, categoryId, date, notes } = req.body;
    const category = categoryId ? db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(categoryId, req.user.id) : null;

    if (categoryId && !category) {
      return sendError(res, 400, 'Categoria não encontrada para este usuário.');
    }

    const result = db.prepare(
      `INSERT INTO transactions (user_id, category_id, description, amount, type, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(req.user.id, categoryId || null, description.trim(), Number(amount), type, date, notes ? notes.trim() : null);

    const transaction = db.prepare('SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = ?').get(result.lastInsertRowid);
    return sendSuccess(res, 201, transaction, 'Transação criada com sucesso.');
  }
);

router.put(
  '/:id',
  [
    body('description').trim().isLength({ min: 2 }).withMessage('Descrição deve ter pelo menos 2 caracteres.'),
    body('amount').isFloat({ gt: 0 }).withMessage('Valor deve ser maior que zero.'),
    body('type').isIn(['income', 'expense']).withMessage('Tipo inválido.'),
    body('date').isISO8601().withMessage('Data inválida.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!transaction) {
      return sendError(res, 404, 'Transação não encontrada.');
    }

    const { description, amount, type, categoryId, date, notes } = req.body;
    const category = categoryId ? db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(categoryId, req.user.id) : null;

    if (categoryId && !category) {
      return sendError(res, 400, 'Categoria não encontrada para este usuário.');
    }

    db.prepare(
      `UPDATE transactions SET category_id = ?, description = ?, amount = ?, type = ?, date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    ).run(categoryId || null, description.trim(), Number(amount), type, date, notes ? notes.trim() : null, req.params.id, req.user.id);

    const updated = db.prepare('SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.id = ?').get(req.params.id);
    return sendSuccess(res, 200, updated, 'Transação atualizada com sucesso.');
  }
);

router.delete('/:id', (req, res) => {
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

  if (!transaction) {
    return sendError(res, 404, 'Transação não encontrada.');
  }

  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return sendSuccess(res, 200, { id: Number(req.params.id) }, 'Transação excluída com sucesso.');
});

module.exports = router;
