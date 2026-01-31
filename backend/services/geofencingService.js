const Geofence = require('../models/Geofence');

/**
 * Geofencing Service
 * Handles geofence validation and alert generation
 */

class GeofencingService {
  /**
   * Check if tourist location violates any geofences
   * @param {Number} lat - Latitude
   * @param {Number} lng - Longitude
   * @returns {Promise<Object>} Geofence violations
   */
  static async checkGeofenceViolations(lat, lng) {
    try {
      // Find all geofences that contain this point
      const geofences = await Geofence.findContainingPoint(lat, lng);
      
      const violations = [];
      let riskScore = 0;

      for (const fence of geofences) {
        if (fence.type === 'restricted_area' || fence.type === 'high_risk') {
          violations.push({
            geofenceId: fence._id,
            name: fence.name,
            type: fence.type,
            riskLevel: fence.riskLevel,
            alertEnabled: fence.alertEnabled
          });
          riskScore += fence.riskLevel;
        }
      }

      return {
        hasViolations: violations.length > 0,
        violations,
        riskScore: Math.min(riskScore, 10),  // Cap at 10
        safeZones: geofences.filter(f => f.type === 'safe_zone'),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Geofence Check Error:', error.message);
      return {
        hasViolations: false,
        violations: [],
        riskScore: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate geofence risk multiplier for safety score
   * @param {Array} violations - Array of geofence violations
   * @returns {Number} Risk multiplier (1-10)
   */
  static calculateRiskMultiplier(violations) {
    if (!violations || violations.length === 0) return 1;
    
    const maxRisk = Math.max(...violations.map(v => v.riskLevel || 5));
    return Math.min(maxRisk, 10);
  }

  /**
   * Get all active geofences
   * @returns {Promise<Array>} All active geofences
   */
  static async getAllGeofences() {
    try {
      return await Geofence.find({ active: true });
    } catch (error) {
      console.error('Get Geofences Error:', error.message);
      return [];
    }
  }

  /**
   * Create a new geofence
   * @param {Object} geofenceData - Geofence configuration
   * @returns {Promise<Object>} Created geofence
   */
  static async createGeofence(geofenceData) {
    try {
      const geofence = new Geofence(geofenceData);
      await geofence.save();
      return {
        success: true,
        geofence
      };
    } catch (error) {
      console.error('Create Geofence Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get restricted areas (high risk zones)
   * @returns {Promise<Array>} Restricted area geofences
   */
  static async getRestrictedAreas() {
    try {
      return await Geofence.getRestrictedAreas();
    } catch (error) {
      console.error('Get Restricted Areas Error:', error.message);
      return [];
    }
  }

  /**
   * Check if tourist should receive an alert
   * @param {Object} tourist - Tourist data
   * @param {Array} violations - Geofence violations
   * @returns {Boolean} Should alert be sent
   */
  static shouldSendAlert(tourist, violations) {
    if (!violations || violations.length === 0) return false;
    
    // Send alert if any violation has alertEnabled
    return violations.some(v => v.alertEnabled);
  }

  /**
   * Generate alert message for geofence violation
   * @param {Object} tourist - Tourist data
   * @param {Array} violations - Geofence violations
   * @returns {String} Alert message
   */
  static generateAlertMessage(tourist, violations) {
    if (violations.length === 0) return '';
    
    const fence = violations[0];
    return `ALERT: Tourist ${tourist.touristId} has entered ${fence.name} (${fence.type}). Risk Level: ${fence.riskLevel}/10`;
  }
}

module.exports = GeofencingService;
