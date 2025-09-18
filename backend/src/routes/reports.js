const express = require('express');
const { createReport, getUserReports } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', auth, upload.single('photo'), createReport);
router.get('/', auth, getUserReports);

module.exports = router;