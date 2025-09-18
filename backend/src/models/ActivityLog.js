const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 
      'CREATE_ADMIN', 'UPDATE_ADMIN', 'DELETE_ADMIN',
      'UPDATE_REPORT_STATUS', 'ASSIGN_REPORT', 
      'VIEW_ANALYTICS', 'EXPORT_DATA'
    ]
  },
  targetType: {
    type: String,
    enum: ['Admin', 'Report', 'User', 'System']
  },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  location: {
    state: { type: String },
    district: { type: String },
    block: { type: String },
    village: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
ActivityLogSchema.index({ admin: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);