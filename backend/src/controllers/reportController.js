const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    console.log('=== CREATE REPORT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user);

    const { title, description, category, address } = req.body;

    let location = req.body.location;
    if (typeof location === 'string') {
      try { location = JSON.parse(location); } catch { location = undefined; }
    }

    console.log('Parsed fields:', { title, description, category, address, location });

    let photo = null;
    if (req.file) {
      photo = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (req.body.photo) {
      photo = req.body.photo; // fallback if you still send base64
    }

    // Parse manual location if provided
    let manualLocation = null;
    if (req.body.manualLocation) {
      try {
        manualLocation = JSON.parse(req.body.manualLocation);
      } catch (e) {
        console.error('Error parsing manual location:', e);
      }
    }

    if (!title || !description || !category || !location) {
      console.log('Missing fields validation failed - Required:', {title: !!title, description: !!description, category: !!category, location: !!location, photo: !!photo});
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: {title: !!title, description: !!description, category: !!category, location: !!location, photo: !!photo}
      });
    }

    // Use manual location for administrative location if provided
    const administrativeLocation = manualLocation && (manualLocation.state || manualLocation.district) ? {
      state: manualLocation.state || 'Madhya Pradesh',
      district: manualLocation.district || 'Khargone', 
      block: manualLocation.block || 'Kasrawad Tahsil',
      village: manualLocation.village || 'Dharampuri',
      landmark: manualLocation.landmark || '',
      pincode: manualLocation.pincode || ''
    } : {
      state: 'Madhya Pradesh',
      district: 'Khargone',
      block: 'Kasrawad Tahsil',
      village: 'Dharampuri',
      landmark: '',
      pincode: ''
    };

    const report = new Report({
      title,
      description,
      category,
      photo,
      location,
      address,
      user: req.user.id,
      administrativeLocation
    });

    console.log('Report object before save:', report);

    await report.save();
    console.log('Report saved successfully:', report._id);
    res.status(201).json(report);
  } catch (err) {
    console.error('Error in createReport:', err);
    console.error('Stack trace:', err.stack);
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createReport, getUserReports };