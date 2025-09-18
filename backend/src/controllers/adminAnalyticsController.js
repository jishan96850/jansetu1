const Report = require('../models/Report');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const { createLocationQuery } = require('../utils/locationHelpers');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    // Build location query based on admin role
    const locationQuery = createLocationQuery(req.admin);

    // Debug: Check what reports exist for debugging
    const allReports = await Report.find({}, 'administrativeLocation title status').limit(10);
    console.log('All reports in database:', allReports);
    
    // Debug: Check reports with location query
    const filteredReports = await Report.find(locationQuery, 'administrativeLocation title status').limit(10);
    console.log('Filtered reports for admin:', filteredReports);
    console.log('Admin state:', req.admin.location.state);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get comprehensive analytics
    const [
      totalComplaints,
      todayComplaints,
      weekComplaints,
      monthComplaints,
      statusDistribution,
      categoryDistribution,
      priorityDistribution,
      resolutionTimeStats,
      adminPerformance,
      recentActivity
    ] = await Promise.all([
      // Total complaints
      Report.countDocuments(locationQuery),
      
      // Today's complaints
      Report.countDocuments({
        ...locationQuery,
        createdAt: { $gte: startOfDay }
      }),
      
      // This week's complaints
      Report.countDocuments({
        ...locationQuery,
        createdAt: { $gte: startOfWeek }
      }),
      
      // This month's complaints
      Report.countDocuments({
        ...locationQuery,
        createdAt: { $gte: startOfMonth }
      }),
      
      // Status distribution with percentages
      Report.aggregate([
        { $match: locationQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]),
      
      // Category distribution
      Report.aggregate([
        { $match: locationQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            category: '$_id',
            count: 1,
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Priority distribution
      Report.aggregate([
        { $match: locationQuery },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            priority: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]),
      
      // Resolution time statistics
      Report.aggregate([
        {
          $match: {
            ...locationQuery,
            status: 'Resolved',
            actualResolutionTime: { $exists: true }
          }
        },
        {
          $project: {
            resolutionTimeHours: {
              $divide: [
                { $subtract: ['$actualResolutionTime', '$createdAt'] },
                1000 * 60 * 60
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTimeHours' },
            minResolutionTime: { $min: '$resolutionTimeHours' },
            maxResolutionTime: { $max: '$resolutionTimeHours' },
            totalResolved: { $sum: 1 }
          }
        }
      ]),
      
      // Admin performance (for higher level admins)
      req.admin.role !== 'VillageAdmin' ? Report.aggregate([
        {
          $match: {
            ...locationQuery,
            assignedTo: { $exists: true }
          }
        },
        {
          $lookup: {
            from: 'admins',
            localField: 'assignedTo',
            foreignField: '_id',
            as: 'assignedAdmin'
          }
        },
        {
          $unwind: '$assignedAdmin'
        },
        {
          $group: {
            _id: '$assignedTo',
            adminName: { $first: '$assignedAdmin.name' },
            adminRole: { $first: '$assignedAdmin.role' },
            totalAssigned: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            adminName: 1,
            adminRole: 1,
            totalAssigned: 1,
            resolved: 1,
            inProgress: 1,
            pending: 1,
            resolutionRate: {
              $cond: [
                { $gt: ['$totalAssigned', 0] },
                { $multiply: [{ $divide: ['$resolved', '$totalAssigned'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { resolutionRate: -1 } },
        { $limit: 10 }
      ]) : [],
      
      // Recent activity logs
      ActivityLog.find({
        'location.state': req.admin.location.state,
        ...(req.admin.location.district && { 'location.district': req.admin.location.district }),
        ...(req.admin.location.block && { 'location.block': req.admin.location.block }),
        ...(req.admin.location.village && { 'location.village': req.admin.location.village })
      })
        .populate('admin', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate trends (compare with previous period)
    const [prevWeekComplaints, prevMonthComplaints] = await Promise.all([
      Report.countDocuments({
        ...locationQuery,
        createdAt: {
          $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lt: startOfWeek
        }
      }),
      Report.countDocuments({
        ...locationQuery,
        createdAt: {
          $gte: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1),
          $lt: startOfMonth
        }
      })
    ]);

    // Calculate trends
    const weekTrend = prevWeekComplaints > 0 ? 
      ((weekComplaints - prevWeekComplaints) / prevWeekComplaints * 100) : 0;
    const monthTrend = prevMonthComplaints > 0 ? 
      ((monthComplaints - prevMonthComplaints) / prevMonthComplaints * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          total: totalComplaints,
          today: todayComplaints,
          thisWeek: weekComplaints,
          thisMonth: monthComplaints,
          trends: {
            week: weekTrend,
            month: monthTrend
          }
        },
        distributions: {
          status: statusDistribution,
          category: categoryDistribution,
          priority: priorityDistribution
        },
        performance: {
          resolutionStats: resolutionTimeStats[0] || {
            avgResolutionTime: 0,
            minResolutionTime: 0,
            maxResolutionTime: 0,
            totalResolved: 0
          },
          adminPerformance: adminPerformance || []
        },
        recentActivity: recentActivity.map(activity => ({
          id: activity._id,
          action: activity.action,
          admin: activity.admin,
          createdAt: activity.createdAt,
          details: activity.details
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get complaints trend data
const getComplaintsTrend = async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y
    
    let days;
    switch(period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 7;
    }

    // Build location query
    const locationQuery = createLocationQuery(req.admin);

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trendData = await Report.aggregate([
      {
        $match: {
          ...locationQuery,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { trendData }
    });

  } catch (error) {
    console.error('Get complaints trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get location-wise statistics
const getLocationStats = async (req, res) => {
  try {
    // Build aggregation based on admin role
    let groupBy, locationQuery = {};
    
    switch(req.admin.role) {
      case 'StateAdmin':
        groupBy = '$administrativeLocation.district';
        locationQuery['administrativeLocation.state'] = req.admin.location.state;
        break;
      case 'DistrictAdmin':
        groupBy = '$administrativeLocation.block';
        locationQuery['administrativeLocation.state'] = req.admin.location.state;
        locationQuery['administrativeLocation.district'] = req.admin.location.district;
        break;
      case 'BlockAdmin':
        groupBy = '$administrativeLocation.village';
        locationQuery['administrativeLocation.state'] = req.admin.location.state;
        locationQuery['administrativeLocation.district'] = req.admin.location.district;
        // Use regex to match block names that might have "Tehsil" suffix
        const blockName = req.admin.location.block;
        const cleanBlockName = blockName.replace(/\s+(tehsil|Tehsil|TEHSIL)$/i, '').trim();
        locationQuery['administrativeLocation.block'] = { 
          $regex: new RegExp(`^${cleanBlockName}(\\s+(tehsil|Tehsil|TEHSIL))?$`, 'i') 
        };
        break;
      default:
        return res.json({
          success: true,
          data: { locationStats: [] }
        });
    }

    const locationStats = await Report.aggregate([
      { $match: locationQuery },
      {
        $group: {
          _id: groupBy,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          location: '$_id',
          total: 1,
          pending: 1,
          inProgress: 1,
          resolved: 1,
          high: 1,
          critical: 1,
          resolutionRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] },
              0
            ]
          },
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: { locationStats }
    });

  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getComplaintsTrend,
  getLocationStats
};
