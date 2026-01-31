const axios = require('axios');

const BLOCKCHAIN_API_URL = process.env.BLOCKCHAIN_API_URL || 'http://localhost:4000';

/**
 * Blockchain Service Integration
 * Connects backend to blockchain for immutable logging
 */

class BlockchainService {
  /**
   * Anchor incident to blockchain
   * @param {Object} incident - Incident data to log
   * @returns {Promise<Object>} Blockchain transaction result
   */
  static async logIncident(incident) {
    try {
      const credential = JSON.stringify({
        incidentId: incident.incidentId,
        type: incident.type,
        touristId: incident.touristId,
        timestamp: incident.createdAt || new Date().toISOString(),
        severity: incident.severity,
        location: incident.location
      });

      const response = await axios.post(`${BLOCKCHAIN_API_URL}/anchor`, {
        credential
      }, {
        timeout: 10000
      });

      return {
        success: true,
        vcHash: response.data.vcHash,
        expiry: response.data.expiry,
        message: 'Incident logged to blockchain',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Blockchain Logging Error:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to log to blockchain',
        timestamp: new Date()
      };
    }
  }

  /**
   * Log tourist activity to blockchain
   * @param {Object} activity - Tourist activity data
   * @returns {Promise<Object>} Blockchain transaction result
   */
  static async logTouristActivity(activity) {
    try {
      const credential = JSON.stringify({
        touristId: activity.touristId,
        activityType: activity.type,
        location: activity.location,
        timestamp: activity.timestamp || new Date().toISOString(),
        safetyScore: activity.safetyScore
      });

      const response = await axios.post(`${BLOCKCHAIN_API_URL}/anchor`, {
        credential
      }, {
        timeout: 10000
      });

      return {
        success: true,
        vcHash: response.data.vcHash,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Blockchain Activity Logging Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify incident authenticity
   * @param {String} vcHash - Blockchain hash to verify
   * @returns {Promise<Object>} Verification result
   */
  static async verifyIncident(vcHash) {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/verify/${vcHash}`, {
        timeout: 5000
      });

      return {
        success: true,
        verified: !response.data.revoked,
        data: response.data
      };
    } catch (error) {
      console.error('Blockchain Verification Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Revoke a credential (mark incident as invalid)
   * @param {String} vcHash - Hash to revoke
   * @returns {Promise<Object>} Revocation result
   */
  static async revokeCredential(vcHash) {
    try {
      const response = await axios.post(`${BLOCKCHAIN_API_URL}/revoke`, {
        vcHash
      }, {
        timeout: 10000
      });

      return {
        success: true,
        message: response.data.message,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Blockchain Revocation Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get blockchain logs
   * @returns {Promise<Object>} All blockchain logs
   */
  static async getLogs() {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/logs`, {
        timeout: 5000
      });

      return {
        success: true,
        logs: response.data,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Blockchain Get Logs Error:', error.message);
      return {
        success: false,
        error: error.message,
        logs: []
      };
    }
  }

  /**
   * Check blockchain service health
   * @returns {Promise<Boolean>} Service availability
   */
  static async checkHealth() {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/`, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      console.log('Blockchain Service unavailable');
      return false;
    }
  }
}

module.exports = BlockchainService;
