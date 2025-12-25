const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// GET route for auth API info
router.get('/', (req, res) => {
  res.json({
    message: 'Auth API Endpoints',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      get_profile: 'GET /api/auth/me (requires auth)'
    }
  });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;