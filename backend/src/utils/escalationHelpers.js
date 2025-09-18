const Report = require('../models/Report');

// Escalation hierarchy
const ESCALATION_HIERARCHY = ['village', 'block', 'district', 'state'];
const ESCALATION_DAYS = 3; // Days after which to escalate

// Get next escalation level
const getNextLevel = (currentLevel) => {
  const currentIndex = ESCALATION_HIERARCHY.indexOf(currentLevel);
  if (currentIndex === -1 || currentIndex === ESCALATION_HIERARCHY.length - 1) {
    return null; // Already at highest level or invalid level
  }
  return ESCALATION_HIERARCHY[currentIndex + 1];
};

// Check if complaint should be escalated
const shouldEscalate = (report) => {
  // Don't escalate if already resolved or rejected
  if (['Resolved', 'Rejected'].includes(report.status)) {
    return false;
  }

  // Don't escalate if already at state level
  if (report.assignedLevel === 'state') {
    return false;
  }

  // Check if 3 days have passed since last escalation or creation
  const baseDate = report.lastEscalationDate || report.createdAt;
  const daysPassed = Math.floor((Date.now() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysPassed >= ESCALATION_DAYS;
};

// Escalate a single complaint
const escalateComplaint = async (reportId) => {
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      console.log(`Report ${reportId} not found`);
      return false;
    }

    if (!shouldEscalate(report)) {
      return false;
    }

    const nextLevel = getNextLevel(report.assignedLevel);
    if (!nextLevel) {
      console.log(`Report ${reportId} already at highest level: ${report.assignedLevel}`);
      return false;
    }

    // Calculate days at current level
    const baseDate = report.lastEscalationDate || report.createdAt;
    const daysAtCurrentLevel = Math.floor((Date.now() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

    // Add escalation to history
    report.escalationHistory.push({
      fromLevel: report.assignedLevel,
      toLevel: nextLevel,
      escalatedAt: new Date(),
      reason: `Auto-escalation after ${daysAtCurrentLevel} days`,
      daysAtPreviousLevel: daysAtCurrentLevel
    });

    // Update assigned level and escalation date
    report.assignedLevel = nextLevel;
    report.lastEscalationDate = new Date();
    report.updatedAt = new Date();

    // Add status history entry
    report.statusHistory.push({
      status: report.status,
      updatedAt: new Date(),
      comment: `Escalated from ${report.assignedLevel} to ${nextLevel} level due to inactivity`
    });

    await report.save();

    console.log(`✅ Report ${report.publicId} escalated from ${report.assignedLevel} to ${nextLevel}`);
    return true;

  } catch (error) {
    console.error(`Error escalating report ${reportId}:`, error);
    return false;
  }
};

// Escalate all pending complaints
const escalateAllPendingComplaints = async () => {
  try {
    console.log('🔄 Starting auto-escalation process...');
    
    // Find all reports that are not resolved/rejected and not at state level
    const reports = await Report.find({
      status: { $nin: ['Resolved', 'Rejected'] },
      assignedLevel: { $ne: 'state' }
    });

    console.log(`Found ${reports.length} reports to check for escalation`);

    let escalatedCount = 0;
    for (const report of reports) {
      const wasEscalated = await escalateComplaint(report._id);
      if (wasEscalated) {
        escalatedCount++;
      }
    }

    console.log(`✅ Auto-escalation complete. ${escalatedCount} reports escalated.`);
    return escalatedCount;

  } catch (error) {
    console.error('Error in auto-escalation process:', error);
    return 0;
  }
};

// Manual escalation by admin
const manualEscalate = async (reportId, adminId, reason = 'Manual escalation') => {
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const nextLevel = getNextLevel(report.assignedLevel);
    if (!nextLevel) {
      throw new Error('Already at highest escalation level');
    }

    // Calculate days at current level
    const baseDate = report.lastEscalationDate || report.createdAt;
    const daysAtCurrentLevel = Math.floor((Date.now() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

    // Add escalation to history
    report.escalationHistory.push({
      fromLevel: report.assignedLevel,
      toLevel: nextLevel,
      escalatedAt: new Date(),
      reason: reason,
      daysAtPreviousLevel: daysAtCurrentLevel,
      escalatedBy: adminId
    });

    // Update assigned level and escalation date
    const previousLevel = report.assignedLevel;
    report.assignedLevel = nextLevel;
    report.lastEscalationDate = new Date();
    report.updatedAt = new Date();

    // Add status history entry
    report.statusHistory.push({
      status: report.status,
      updatedBy: adminId,
      updatedAt: new Date(),
      comment: `Manually escalated from ${previousLevel} to ${nextLevel} level: ${reason}`
    });

    await report.save();

    console.log(`✅ Report ${report.publicId} manually escalated from ${previousLevel} to ${nextLevel}`);
    return report;

  } catch (error) {
    console.error(`Error in manual escalation:`, error);
    throw error;
  }
};

module.exports = {
  getNextLevel,
  shouldEscalate,
  escalateComplaint,
  escalateAllPendingComplaints,
  manualEscalate,
  ESCALATION_HIERARCHY,
  ESCALATION_DAYS
};
