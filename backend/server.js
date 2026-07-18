const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TADUNG06 Backend Running',
    timestamp: new Date()
  });
});

// Server listening
app.listen(PORT, () => {
  console.log(`🎮 TADUNG06 Backend running on port ${PORT}`);
});

module.exports = app;