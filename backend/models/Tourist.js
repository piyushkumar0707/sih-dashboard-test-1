const mongoose = require('mongoose');

const touristSchema = new mongoose.Schema({
  touristId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  },
  name: { 
    type: String, 
    required: true 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  safetyScore: { 
    type: Number, 
    default: 85,
    min: 0,
    max: 100
  },
  status: { 
    type: String, 
    enum: ['active', 'high-risk', 'emergency', 'inactive'],
    default: 'active'
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  accuracy: { 
    type: Number, 
    default: 0 
  },
  deviceId: {
    type: String
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for geospatial queries
touristSchema.index({ location: '2dsphere' });

// Index for efficient queries
touristSchema.index({ status: 1, safetyScore: 1 });
touristSchema.index({ userId: 1 });

// Method to update location
touristSchema.methods.updateLocation = function(lat, lng, accuracy) {
  this.location = { lat, lng };
  this.accuracy = accuracy || 0;
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update safety score
touristSchema.methods.updateSafetyScore = function(score) {
  this.safetyScore = Math.max(0, Math.min(100, score));
  // Automatically update status based on score
  if (this.safetyScore < 50) {
    this.status = 'high-risk';
  } else if (this.safetyScore < 70) {
    this.status = 'active';
  } else {
    this.status = 'active';
  }
  return this.save();
};

// Static method to get high-risk tourists
touristSchema.statics.getHighRiskTourists = function() {
  return this.find({ 
    $or: [
      { safetyScore: { $lt: 70 } },
      { status: 'high-risk' },
      { status: 'emergency' }
    ]
  });
};

// Static method to get active tourists count
touristSchema.statics.getActiveCount = function() {
  return this.countDocuments({ status: 'active' });
};

module.exports = mongoose.model('Tourist', touristSchema);
