const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId, type: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Log admin activity
const logActivity = async (adminId, action, details = {}, req = null) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return;

    await ActivityLog.create({
      admin: adminId,
      action,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent'),
      location: admin.location
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Log login activity
    await logActivity(admin._id, 'LOGIN', { 
      loginTime: new Date(),
      role: admin.role 
    }, req);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          location: admin.location,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Admin logout
const adminLogout = async (req, res) => {
  try {
    // Log logout activity
    await logActivity(req.admin.id, 'LOGOUT', { 
      logoutTime: new Date() 
    }, req);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get current admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id)
      .select('-password')
      .populate('createdBy', 'name email role');

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      data: { admin }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    const oldData = { name: admin.name, email: admin.email };

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    admin.updatedAt = new Date();

    await admin.save();

    // Log update activity
    await logActivity(admin._id, 'UPDATE_ADMIN', {
      targetType: 'Admin',
      targetId: admin._id,
      before: oldData,
      after: { name: admin.name, email: admin.email }
    }, req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          location: admin.location
        }
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Change admin password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    admin.password = newPassword;
    admin.updatedAt = new Date();
    await admin.save();

    // Log password change activity
    await logActivity(admin._id, 'UPDATE_ADMIN', {
      targetType: 'Admin',
      targetId: admin._id,
      metadata: { action: 'password_change' }
    }, req);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  logActivity
};