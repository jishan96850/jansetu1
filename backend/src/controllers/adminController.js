const Admin = require('../models/Admin');
const { logActivity } = require('./adminAuthController');

// Create sub-admin
const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !location) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password,
      role,
      location,
      createdBy: req.admin._id
    });

    await newAdmin.save();

    // Log activity
    await logActivity(req.admin._id, 'CREATE_ADMIN', {
      targetType: 'Admin',
      targetId: newAdmin._id,
      after: {
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        location: newAdmin.location
      }
    }, req);

    res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      data: {
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          location: newAdmin.location,
          isActive: newAdmin.isActive,
          createdAt: newAdmin.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create sub-admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all sub-admins under current admin
const getSubAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role: filterRole, isActive } = req.query;
    
    // Build query based on admin's hierarchy
    let query = {};
    
    // Location-based filtering
    switch(req.admin.role) {
      case 'StateAdmin':
        query['location.state'] = req.admin.location.state;
        break;
      case 'DistrictAdmin':
        query['location.state'] = req.admin.location.state;
        query['location.district'] = req.admin.location.district;
        break;
      case 'BlockAdmin':
        query['location.state'] = req.admin.location.state;
        query['location.district'] = req.admin.location.district;
        query['location.block'] = req.admin.location.block;
        break;
      default:
        // VillageAdmin cannot create sub-admins
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
    }

    // Additional filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (filterRole) {
      query.role = filterRole;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Exclude self from results
    query._id = { $ne: req.admin._id };

    const skip = (page - 1) * limit;
    
    const [admins, total] = await Promise.all([
      Admin.find(query)
        .select('-password')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Admin.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        admins,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: admins.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get sub-admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get admin details by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)
      .select('-password')
      .populate('createdBy', 'name email role');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if current admin can view this admin
    if (!req.admin.canManage(admin) && admin._id.toString() !== req.admin._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { admin }
    });

  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isActive, permissions } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if current admin can manage this admin
    if (!req.admin.canManage(admin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const oldData = {
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      permissions: admin.permissions
    };

    // Update fields
    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (isActive !== undefined) admin.isActive = isActive;
    if (permissions !== undefined) {
      admin.permissions = { ...admin.permissions, ...permissions };
    }
    admin.updatedAt = new Date();

    await admin.save();

    // Log activity
    await logActivity(req.admin._id, 'UPDATE_ADMIN', {
      targetType: 'Admin',
      targetId: admin._id,
      before: oldData,
      after: {
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
        permissions: admin.permissions
      }
    }, req);

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          location: admin.location,
          isActive: admin.isActive,
          permissions: admin.permissions,
          updatedAt: admin.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete/Deactivate admin
const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent self-deletion
    if (req.admin._id.toString() === adminId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Permanently delete from database
    await Admin.findByIdAndDelete(adminId);

    // Log activity
    await logActivity(req.admin._id, 'DELETE_ADMIN', {
      targetType: 'Admin',
      targetId: admin._id,
      targetEmail: admin.email,
      targetRole: admin.role,
      metadata: { action: 'permanent_delete' }
    }, req);

    res.json({
      success: true,
      message: 'Admin permanently deleted from database'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get admin hierarchy
const getAdminHierarchy = async (req, res) => {
  try {
    // Build hierarchy tree starting from current admin
    const buildHierarchy = async (parentId = null, level = 0) => {
      if (level > 4) return []; // Prevent infinite recursion

      let query = {};
      if (parentId) {
        query.createdBy = parentId;
      } else {
        // Start from current admin
        query._id = req.admin._id;
      }

      const admins = await Admin.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      const hierarchy = [];
      for (const admin of admins) {
        const children = await buildHierarchy(admin._id, level + 1);
        hierarchy.push({
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          location: admin.location,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
          children
        });
      }

      return hierarchy;
    };

    const hierarchy = await buildHierarchy();

    res.json({
      success: true,
      data: { hierarchy }
    });

  } catch (error) {
    console.error('Get admin hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createSubAdmin,
  getSubAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAdminHierarchy
};