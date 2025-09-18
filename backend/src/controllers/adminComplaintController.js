const Report = require('../models/Report');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { logActivity } = require('./adminAuthController');
const { createLocationQuery, createEscalationQuery, canUpdateComplaintStatus } = require('../utils/locationHelpers');
const { escalateAllPendingComplaints, manualEscalate } = require('../utils/escalationHelpers');

// Get complaints with filtering and pagination
const getComplaints = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority, 
      search,
      startDate,
      endDate,
      assignedTo
    } = req.query;

    // Build simple query without location/escalation filtering
    let query = {};

    // Apply basic filters only
    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { publicId: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Report.find(query)
        .populate('user', 'email')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments(query)
    ]);

    console.log('📊 Query Results:');
    console.log('Total found:', total);
    console.log('Returned:', complaints.length);
    console.log('Query used:', JSON.stringify(query, null, 2));
    if (complaints.length > 0) {
      console.log('Sample complaints:', complaints.slice(0, 3).map(c => ({
        title: c.title,
        publicId: c.publicId,
        location: c.administrativeLocation
      })));
    }

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: complaints.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Report.findById(id)
      .populate('user', 'email')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.updatedBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if admin has access to this complaint's location
    const hasAccess = checkLocationAccess(req.admin, complaint.administrativeLocation);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { complaint }
    });

  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, priority, estimatedResolutionTime } = req.body;

    const complaint = await Report.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if admin can update this complaint based on escalation level
    const canUpdate = canUpdateComplaintStatus(req.admin, complaint);
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This complaint is assigned to ${complaint.assignedLevel} level. Only ${complaint.assignedLevel} admins can update it.`
      });
    }

    const oldStatus = complaint.status;
    const oldPriority = complaint.priority;

    // Update fields
    if (status) {
      complaint.status = status;
      if (status === 'Resolved') {
        complaint.actualResolutionTime = new Date();
      }
    }

    if (priority) {
      complaint.priority = priority;
    }

    if (estimatedResolutionTime) {
      complaint.estimatedResolutionTime = new Date(estimatedResolutionTime);
    }

    // Add to status history
    complaint.statusHistory.push({
      status: complaint.status,
      updatedBy: req.admin._id,
      updatedAt: new Date(),
      comment: comment || ''
    });

    complaint.updatedAt = new Date();
    await complaint.save();

    // Log activity
    await logActivity(req.admin._id, 'UPDATE_REPORT_STATUS', {
      targetType: 'Report',
      targetId: complaint._id,
      before: { status: oldStatus, priority: oldPriority },
      after: { status: complaint.status, priority: complaint.priority },
      metadata: { comment }
    }, req);

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: { complaint }
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Assign complaint to admin
const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const complaint = await Report.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check access
    const hasAccess = checkLocationAccess(req.admin, complaint.administrativeLocation);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify assigned admin exists and is in same hierarchy
    if (assignedTo) {
      const targetAdmin = await Admin.findById(assignedTo);
      if (!targetAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Target admin not found'
        });
      }

      // Check if current admin can assign to target admin
      if (!req.admin.canManage(targetAdmin) && targetAdmin._id.toString() !== req.admin._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Cannot assign to this admin'
        });
      }
    }

    const oldAssignedTo = complaint.assignedTo;
    complaint.assignedTo = assignedTo || null;
    complaint.updatedAt = new Date();

    await complaint.save();

    // Log activity
    await logActivity(req.admin._id, 'ASSIGN_REPORT', {
      targetType: 'Report',
      targetId: complaint._id,
      before: { assignedTo: oldAssignedTo },
      after: { assignedTo: complaint.assignedTo }
    }, req);

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: { complaint }
    });

  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get complaint statistics
const getComplaintStats = async (req, res) => {
  try {
    // Build location query
    const locationQuery = createLocationQuery(req.admin);

    // Get various statistics
    const [
      totalComplaints,
      statusStats,
      categoryStats,
      priorityStats,
      monthlyStats,
      assignedToMe
    ] = await Promise.all([
      // Total complaints
      Report.countDocuments(locationQuery),
      
      // Status distribution
      Report.aggregate([
        { $match: locationQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Category distribution
      Report.aggregate([
        { $match: locationQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      // Priority distribution
      Report.aggregate([
        { $match: locationQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      
      // Monthly statistics for last 12 months
      Report.aggregate([
        {
          $match: {
            ...locationQuery,
            createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Complaints assigned to current admin
      Report.countDocuments({
        ...locationQuery,
        assignedTo: req.admin._id
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalComplaints,
          assignedToMe
        },
        statusDistribution: statusStats,
        categoryDistribution: categoryStats,
        priorityDistribution: priorityStats,
        monthlyTrends: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to check location access
const checkLocationAccess = (admin, targetLocation) => {
  const adminLocation = admin.location;

  switch(admin.role) {
    case 'StateAdmin':
      return targetLocation.state === adminLocation.state;
      
    case 'DistrictAdmin':
      return targetLocation.state === adminLocation.state && 
             targetLocation.district === adminLocation.district;
             
    case 'BlockAdmin':
      return targetLocation.state === adminLocation.state && 
             targetLocation.district === adminLocation.district &&
             targetLocation.block === adminLocation.block;
             
    case 'VillageAdmin':
      return targetLocation.state === adminLocation.state && 
             targetLocation.district === adminLocation.district &&
             targetLocation.block === adminLocation.block &&
             targetLocation.village === adminLocation.village;
             
    default:
      return false;
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  getComplaintStats
};
