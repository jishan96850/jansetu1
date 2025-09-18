const Report = require('../models/Report');

// Get public statistics for homepage
const getPublicStats = async (req, res) => {
  try {
    console.log('📊 Fetching public statistics...');

    // Get total issues reported
    const totalReported = await Report.countDocuments();
    
    // Get resolved issues (using actual database status values)
    const totalResolved = await Report.countDocuments({ 
      status: { $in: ['Resolved', 'completed', 'Complete'] } 
    });
    
    // Calculate resolution rate
    const resolutionRate = totalReported > 0 ? Math.round((totalResolved / totalReported) * 100) : 0;
    
    // Get pending issues (using actual database status values)
    const totalPending = await Report.countDocuments({ 
      status: { $in: ['Pending', 'pending', 'In Progress', 'in-progress'] } 
    });

    const stats = {
      totalReported,
      totalResolved,
      totalPending,
      resolutionRate
    };

    console.log('📈 Statistics calculated:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get detailed statistics for admin dashboard
const getDetailedStats = async (req, res) => {
  try {
    console.log('📊 Fetching detailed statistics...');

    // Get stats by status
    const statusStats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get stats by category
    const categoryStats = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get stats by priority
    const priorityStats = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent reports (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get escalation stats
    const escalationStats = await Report.aggregate([
      {
        $group: {
          _id: '$assignedLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        categoryStats,
        priorityStats,
        recentReports,
        escalationStats
      }
    });

  } catch (error) {
    console.error('Detailed stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed statistics',
      error: error.message
    });
  }
};

module.exports = {
  getPublicStats,
  getDetailedStats
};
