const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['safe_zone', 'restricted_area', 'high_risk', 'tourist_attraction', 'emergency_zone'],
    required: true
  },
  description: {
    type: String
  },
  geometry: {
    type: { 
      type: String, 
      enum: ['Point', 'Polygon'],
      required: true 
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    radius: {
      type: Number  // For Point type, in meters
    }
  },
  riskLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  active: {
    type: Boolean,
    default: true
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },
  metadata: {
    operatingHours: {
      start: String,
      end: String
    },
    capacity: Number,
    currentOccupancy: Number
  }
}, {
  timestamps: true
});

// Index for geospatial queries
geofenceSchema.index({ geometry: '2dsphere' });
geofenceSchema.index({ type: 1, active: 1 });

// Method to check if a point is inside the geofence
geofenceSchema.methods.containsPoint = function(lat, lng) {
  if (this.geometry.type === 'Circle') {
    const point = [lng, lat];
    const center = this.geometry.coordinates;
    const distance = this.calculateDistance(center[1], center[0], lat, lng);
    return distance <= this.geometry.radius;
  }
  // For Polygon, MongoDB geospatial query would be used
  return false;
};

// Calculate distance between two points (Haversine formula)
geofenceSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Static method to find geofences containing a point
geofenceSchema.statics.findContainingPoint = function(lat, lng) {
  return this.find({
    active: true,
    geometry: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    }
  });
};

// Static method to get all active restricted areas
geofenceSchema.statics.getRestrictedAreas = function() {
  return this.find({ 
    type: { $in: ['restricted_area', 'high_risk'] },
    active: true 
  });
};

module.exports = mongoose.model('Geofence', geofenceSchema);
