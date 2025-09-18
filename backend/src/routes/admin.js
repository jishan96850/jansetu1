const express = require('express');
const router = express.Router();
const AdminAuth = require('../middleware/adminAuth');
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');
const adminComplaintController = require('../controllers/adminComplaintController');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

// Admin Authentication Routes
router.post('/auth/login', adminAuthController.adminLogin);
router.post('/auth/logout', AdminAuth.requireAuth, adminAuthController.adminLogout);
router.post('/auth/change-password', AdminAuth.requireAuth, adminAuthController.changePassword);
router.get('/auth/profile', AdminAuth.requireAuth, adminAuthController.getAdminProfile);

// Admin Management Routes (Higher level admins only)
router.post('/create-sub-admin', 
  AdminAuth.requireAuth, 
  AdminAuth.requireRole(['StateAdmin', 'DistrictAdmin', 'BlockAdmin']), 
  adminController.createSubAdmin
);

router.get('/sub-admins', 
  AdminAuth.requireAuth, 
  AdminAuth.requireRole(['StateAdmin', 'DistrictAdmin', 'BlockAdmin']), 
  adminController.getSubAdmins
);

router.put('/update-admin/:adminId', 
  AdminAuth.requireAuth, 
  AdminAuth.requireRole(['StateAdmin', 'DistrictAdmin', 'BlockAdmin']), 
  adminController.updateAdmin
);

router.delete('/delete-admin/:adminId', 
  AdminAuth.requireAuth, 
  AdminAuth.requireRole(['StateAdmin', 'DistrictAdmin', 'BlockAdmin']), 
  adminController.deleteAdmin
);

// Complaint Management Routes
router.get('/complaints', AdminAuth.requireAuth, adminComplaintController.getComplaints);
router.get('/complaints/:id', AdminAuth.requireAuth, adminComplaintController.getComplaintById);
router.put('/complaints/:id/status', AdminAuth.requireAuth, adminComplaintController.updateComplaintStatus);
router.put('/complaints/:id/assign', 
  AdminAuth.requireAuth, 
  AdminAuth.requireRole(['StateAdmin', 'DistrictAdmin', 'BlockAdmin']), 
  adminComplaintController.assignComplaint
);
router.get('/complaints-stats', AdminAuth.requireAuth, adminComplaintController.getComplaintStats);

// Analytics Routes
router.get('/analytics/dashboard', AdminAuth.requireAuth, adminAnalyticsController.getDashboardAnalytics);
router.get('/analytics/trends', AdminAuth.requireAuth, adminAnalyticsController.getComplaintsTrend);
router.get('/analytics/locations', 
  AdminAuth.requireAuth, 
  AdminAuth.requireRole(['StateAdmin', 'DistrictAdmin', 'BlockAdmin']), 
  adminAnalyticsController.getLocationStats
);

module.exports = router;