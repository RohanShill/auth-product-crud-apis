const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe
} = require('../controllers/authController');

const { registerRules, loginRules } = require('../validators/authValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticate = require('../middlewares/authMiddleware');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh-token', refreshToken);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
