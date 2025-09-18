const express = require('express');
const router = express.Router();
const { getPublicStats, getDetailedStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

// Test route to verify API is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stats API is working!',
    timestamp: new Date().toISOString()
  });
});

// Public route for homepage statistics
router.get('/public', getPublicStats);

// Protected route for detailed admin statistics  
router.get('/detailed', auth, getDetailedStats);

module.exports = router;