const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  photo: { type: String }, // URL to uploaded image
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String },
  administrativeLocation: {
    state: { type: String },
    district: { type: String },
    block: { type: String },
    village: { type: String },
    landmark: { type: String },
    pincode: { type: String }
  },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected']
  },
  priority: {
    type: String,
    default: 'Medium',
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin'
  },
  assignedLevel: {
    type: String,
    default: 'village',
    enum: ['village', 'block', 'district', 'state']
  },
  escalationHistory: [{
    fromLevel: { type: String, required: true },
    toLevel: { type: String, required: true },
    escalatedAt: { type: Date, default: Date.now },
    reason: { type: String, default: 'Auto-escalation after 3 days' },
    daysAtPreviousLevel: { type: Number }
  }],
  lastEscalationDate: { type: Date },
  statusHistory: [{
    status: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    updatedAt: { type: Date, default: Date.now },
    comment: { type: String }
  }],
  publicId: { type: String, unique: true }, // For public tracking
  estimatedResolutionTime: { type: Date },
  actualResolutionTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate public ID before saving
ReportSchema.pre('save', function(next) {
  if (!this.publicId) {
    this.publicId = 'RPT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

// Add status to history when status changes
ReportSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Report', ReportSchema);