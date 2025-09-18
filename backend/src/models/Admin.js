const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['StateAdmin', 'DistrictAdmin', 'BlockAdmin', 'VillageAdmin']
  },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: function() { return this.role !== 'StateAdmin'; } },
    block: { type: String, required: function() { return ['BlockAdmin', 'VillageAdmin'].includes(this.role); } },
    village: { type: String, required: function() { return this.role === 'VillageAdmin'; } }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    required: function() { return this.role !== 'StateAdmin'; }
  },
  isActive: { type: Boolean, default: true },
  permissions: {
    canCreateSubAdmins: { type: Boolean, default: true },
    canManageComplaints: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true }
  },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get hierarchy level (0 = highest authority)
AdminSchema.methods.getHierarchyLevel = function() {
  const levels = {
    'StateAdmin': 0,
    'DistrictAdmin': 1,
    'BlockAdmin': 2,
    'VillageAdmin': 3
  };
  return levels[this.role] || 999;
};

// Check if admin can manage another admin
AdminSchema.methods.canManage = function(targetAdmin) {
  const myLevel = this.getHierarchyLevel();
  const targetLevel = targetAdmin.getHierarchyLevel();
  
  // Can only manage admins at lower levels (higher level numbers)
  // StateAdmin (0) can manage VillageAdmin (3): 0 < 3 = true ✅
  if (myLevel >= targetLevel) {
    return false;
  }
  
  // Check location hierarchy
  let locationMatch = false;
  switch(this.role) {
    case 'StateAdmin':
      locationMatch = this.location.state === targetAdmin.location.state;
      return locationMatch;
    case 'DistrictAdmin':
      locationMatch = this.location.state === targetAdmin.location.state && 
             this.location.district === targetAdmin.location.district;
      return locationMatch;
    case 'BlockAdmin':
      locationMatch = this.location.state === targetAdmin.location.state && 
             this.location.district === targetAdmin.location.district &&
             this.location.block === targetAdmin.location.block;
      return locationMatch;
    default:
      return false;
  }
};

// Get next role in hierarchy
AdminSchema.methods.getNextRole = function() {
  const hierarchy = {
    'StateAdmin': 'DistrictAdmin',
    'DistrictAdmin': 'BlockAdmin',
    'BlockAdmin': 'VillageAdmin'
  };
  return hierarchy[this.role] || null;
};

module.exports = mongoose.model('Admin', AdminSchema);