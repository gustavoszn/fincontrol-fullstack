const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, ensureUserDefaultCategories } = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres.'),
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const { name, email, password } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return sendError(res, 409, 'E-mail já cadastrado.');
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name.trim(), email.toLowerCase(), passwordHash);
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid);

    ensureUserDefaultCategories(user.id);

    const token = generateToken(user);
    return sendSuccess(res, 201, { user, token }, 'Usuário criado com sucesso.');
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('password').notEmpty().withMessage('Senha obrigatória.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Dados inválidos.', errors.array());
    }

    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return sendError(res, 401, 'Credenciais inválidas.');
    }

    const token = generateToken(user);
    const safeUser = { id: user.id, name: user.name, email: user.email };
    return sendSuccess(res, 200, { user: safeUser, token }, 'Login realizado com sucesso.');
  }
);

module.exports = router;
