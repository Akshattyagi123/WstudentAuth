const express = require('express');
const { signup, login, verifyEmail } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);


module.exports = router;
