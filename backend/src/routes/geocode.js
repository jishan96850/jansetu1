const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const r = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { 'User-Agent': 'civic-issue-reporting-app' }
    });
    res.json({ address: r.data.display_name });
  } catch (e) {
    res.status(500).json({ error: 'Geocode error' });
  }
});

module.exports = router;