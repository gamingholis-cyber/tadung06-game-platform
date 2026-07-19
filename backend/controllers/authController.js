const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { username, password, email, full_name, phone, dana_account } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, dan email diperlukan'
      });
    }

    if (username.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Username minimal 6 karakter'
      });
    }

    if (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter (huruf & angka)'
      });
    }

    const conn = await pool.getConnection();

    // Check existing user
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      conn.release();
      return res.status(409).json({
        success: false,
        message: 'Username atau email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await conn.query(
      'INSERT INTO users (username, password, email, full_name, phone, dana_account, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, full_name || 'User', phone || '', dana_account || '', 'active']
    );

    conn.release();

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.'
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password diperlukan'
      });
    }

    const conn = await pool.getConnection();

    const [users] = await conn.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      conn.release();
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      conn.release();
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    if (user.status !== 'active') {
      conn.release();
      return res.status(403).json({
        success: false,
        message: `Akun Anda ${user.status}`
      });
    }

    // Update last login
    await conn.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    conn.release();

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan'
    });
  }
};

module.exports = exports;