const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['Medical Emergency', 'Lost Tourist', 'Emergency Alert', 'Security Threat', 'Natural Disaster', 'Accident', 'Theft', 'Other']
  },
  location: { 
    type: String, 
    required: true 
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Monitoring'],
    default: 'Open'
  },
  touristId: { 
    type: String,
    ref: 'Tourist'
  },
  tourist: {
    type: String  // Tourist name for quick display
  },
  assignedOfficer: { 
    type: String 
  },
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: { 
    type: String, 
    required: true 
  },
  resolution: {
    type: String
  },
  responseTime: {
    type: Number  // in minutes
  },
  resolvedAt: {
    type: Date
  },
  priority: {
    type: Number,
    default: 3,  // 1=highest, 5=lowest
    min: 1,
    max: 5
  },
  evidenceUrls: [{
    type: String
  }],
  blockchainHash: {
    type: String  // Hash of blockchain transaction
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
incidentSchema.index({ status: 1, severity: 1 });
incidentSchema.index({ touristId: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ assignedOfficerId: 1 });

// Virtual for response time calculation
incidentSchema.virtual('actualResponseTime').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60)); // minutes
  }
  return null;
});

// Method to update status
incidentSchema.methods.updateStatus = function(newStatus, resolution) {
  this.status = newStatus;
  if (newStatus === 'Resolved' || newStatus === 'Closed') {
    this.resolvedAt = new Date();
    if (resolution) {
      this.resolution = resolution;
    }
  }
  return this.save();
};

// Method to assign officer
incidentSchema.methods.assignToOfficer = function(officerId, officerName) {
  this.assignedOfficerId = officerId;
  this.assignedOfficer = officerName;
  if (this.status === 'Open') {
    this.status = 'In Progress';
  }
  return this.save();
};

// Static method to get open incidents
incidentSchema.statics.getOpenIncidents = function() {
  return this.find({ 
    status: { $in: ['Open', 'In Progress', 'Monitoring'] }
  }).sort({ createdAt: -1 });
};

// Static method to get high severity incidents
incidentSchema.statics.getHighSeverityIncidents = function() {
  return this.find({ 
    severity: { $in: ['High', 'Critical'] },
    status: { $in: ['Open', 'In Progress'] }
  }).sort({ createdAt: -1 });
};

// Static method to get statistics
incidentSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const open = await this.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
  const resolved = await this.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
  const highSeverity = await this.countDocuments({ severity: { $in: ['High', 'Critical'] } });
  
  return { total, open, resolved, highSeverity };
};

module.exports = mongoose.model('Incident', incidentSchema);
