const axios = require('axios');

const AI_SAFETY_SCORE_URL = process.env.AI_SAFETY_SCORE_URL || 'http://localhost:8001';
const AI_CASE_REPORT_URL = process.env.AI_CASE_REPORT_URL || 'http://localhost:8002';

/**
 * AI Service Integration
 * Connects backend to Python FastAPI microservices
 */

class AIService {
  /**
   * Calculate safety score for a tourist
   * @param {Object} data - Tourist telemetry data
   * @returns {Promise<Object>} Safety score and factors
   */
  static async calculateSafetyScore(data) {
    // Extract parameters safely
    const geofenceRisk = data?.geofenceRisk || 1;
    const anomalies = data?.anomalies || 0;
    const telemetry = data?.telemetry || {};
    
    try {
      const response = await axios.post(`${AI_SAFETY_SCORE_URL}/calculate`, {
        telemetry: telemetry,
        geofence_risk: geofenceRisk,
        anomalies: anomalies
      }, {
        timeout: 45000  // 45 seconds to allow for service wake-up from sleep
      });
      
      return {
        success: true,
        safetyScore: response.data.safety_score,
        factors: {
          geofenceRisk: geofenceRisk,
          anomalies: anomalies
        },
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI Safety Score Service Error:', error.message);
      // Calculate fallback score based on input when service is unavailable
      
      // Simple fallback calculation: Base 100, subtract risk factors
      const calculatedScore = Math.max(0, Math.min(100, 
        100 - (geofenceRisk * 5) - (anomalies * 3)
      ));
      
      return {
        success: false,
        safetyScore: calculatedScore,
        factors: {
          geofenceRisk: geofenceRisk,
          anomalies: anomalies
        },
        error: 'AI service unavailable - using fallback calculation',
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate incident report PDF
   * @param {Object} incidentData - Incident details
   * @returns {Promise<Object>} Report generation result
   */
  static async generateIncidentReport(incidentData) {
    try {
      const response = await axios.post(`${AI_CASE_REPORT_URL}/report`, {
        tourist_id: incidentData.touristId,
        alert: incidentData.type || 'Incident',
        last_location: incidentData.location || 'Unknown'
      }, {
        timeout: 45000  // 45 seconds to allow for service wake-up from sleep
      });
      
      return {
        success: true,
        status: response.data.status,
        filename: response.data.file,
        reportId: `report_${Date.now()}`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI Case Report Service Error:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Analyze tourist behavior patterns
   * @param {Object} touristData - Tourist movement and activity data
   * @returns {Promise<Object>} Behavior analysis results
   */
  static async analyzeBehaviorPatterns(touristData) {
    try {
      // This would call a more sophisticated AI service for pattern analysis
      // For now, return simulated analysis
      const patterns = {
        movementPattern: 'normal',
        riskIndicators: [],
        anomalyScore: 0,
        recommendations: []
      };

      // Simple heuristic analysis
      if (touristData.safetyScore < 50) {
        patterns.riskIndicators.push('Low safety score');
        patterns.anomalyScore += 20;
      }

      if (touristData.status === 'high-risk') {
        patterns.riskIndicators.push('High-risk status');
        patterns.recommendations.push('Immediate officer check-in recommended');
      }

      return {
        success: true,
        patterns,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI Behavior Analysis Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if AI services are healthy
   * @returns {Promise<Object>} Health status of AI services
   */
  static async checkHealth() {
    const services = {
      safetyScore: false,
      caseReport: false
    };

    try {
      const safetyCheck = await axios.get(`${AI_SAFETY_SCORE_URL}/`, { timeout: 45000 });  // 45 seconds
      services.safetyScore = safetyCheck.status === 200;
    } catch (error) {
      console.log('Safety Score Service unavailable');
    }

    try {
      const reportCheck = await axios.get(`${AI_CASE_REPORT_URL}/`, { timeout: 45000 });  // 45 seconds
      services.caseReport = reportCheck.status === 200;
    } catch (error) {
      console.log('Case Report Service unavailable');
    }

    return services;
  }
}

module.exports = AIService;
