const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token type.' 
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Admin not found or inactive.' 
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Role-based access control middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    // Flatten array if nested (fix for array passed as single argument)
    const flatRoles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

    if (!flatRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Check if admin can manage target location
const requireLocationAccess = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  // Extract location from request (query params or body)
  const targetLocation = req.query.location || req.body.location || {};
  const adminLocation = req.admin.location;

  // State admin can access all locations in their state
  if (req.admin.role === 'StateAdmin') {
    if (targetLocation.state && targetLocation.state !== adminLocation.state) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Cannot access data from other states.' 
      });
    }
  }
  
  // District admin can access all locations in their district
  else if (req.admin.role === 'DistrictAdmin') {
    if (targetLocation.state !== adminLocation.state || 
        (targetLocation.district && targetLocation.district !== adminLocation.district)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Cannot access data from other districts.' 
      });
    }
  }
  
  // Block admin can access all locations in their block
  else if (req.admin.role === 'BlockAdmin') {
    if (targetLocation.state !== adminLocation.state || 
        targetLocation.district !== adminLocation.district ||
        (targetLocation.block && targetLocation.block !== adminLocation.block)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Cannot access data from other blocks.' 
      });
    }
  }
  
  // Village admin can only access their village
  else if (req.admin.role === 'VillageAdmin') {
    if (targetLocation.state !== adminLocation.state || 
        targetLocation.district !== adminLocation.district ||
        targetLocation.block !== adminLocation.block ||
        (targetLocation.village && targetLocation.village !== adminLocation.village)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Cannot access data from other villages.' 
      });
    }
  }

  next();
};

// Check if admin can create sub-admin at specific location
const canCreateSubAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  const { role: targetRole, location: targetLocation } = req.body;
  const adminLocation = req.admin.location;

  // Check if admin can create this type of sub-admin
  const nextRole = req.admin.getNextRole();
  if (!nextRole || targetRole !== nextRole) {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied. You can only create ${nextRole} accounts.` 
    });
  }

  // Validate location hierarchy
  switch(req.admin.role) {
    case 'StateAdmin':
      if (targetLocation.state !== adminLocation.state) {
        return res.status(403).json({ 
          success: false, 
          message: 'Can only create district admins in your state.' 
        });
      }
      break;
      
    case 'DistrictAdmin':
      if (targetLocation.state !== adminLocation.state || 
          targetLocation.district !== adminLocation.district) {
        return res.status(403).json({ 
          success: false, 
          message: 'Can only create block admins in your district.' 
        });
      }
      break;
      
    case 'BlockAdmin':
      if (targetLocation.state !== adminLocation.state || 
          targetLocation.district !== adminLocation.district ||
          targetLocation.block !== adminLocation.block) {
        return res.status(403).json({ 
          success: false, 
          message: 'Can only create village admins in your block.' 
        });
      }
      break;
      
    default:
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot create sub-admins.' 
      });
  }

  next();
};

// Check permission for specific action
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!req.admin.permissions[permission]) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Missing permission: ${permission}` 
      });
    }

    next();
  };
};

module.exports = {
  requireAuth: verifyAdminToken,
  verifyAdminToken,
  requireRole,
  requireLocationAccess,
  canCreateSubAdmin,
  requirePermission
};