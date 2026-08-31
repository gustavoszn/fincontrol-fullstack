const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const categories = await db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC').all(req.user.id);
  return sendSuccess(res, 200, categories);
});

router.post(
  '/',
  [body('name').trim().isLength({ min: 2 }).withMessage('Nome da categoria deve ter pelo menos 2 caracteres.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const name = req.body.name.trim();
    const existing = await db.prepare('SELECT id FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(req.user.id, name);

    if (existing) {
      return sendError(res, 409, 'Categoria já existe.');
    }

    const result = await db.prepare('INSERT INTO categories (user_id, name) VALUES (?, ?)').run(req.user.id, name);
    const category = await db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return sendSuccess(res, 201, category, 'Categoria criada com sucesso.');
  }
);

module.exports = router;
