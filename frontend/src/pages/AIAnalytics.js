import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AIAnalytics = () => {
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [telemetryData, setTelemetryData] = useState({ geofenceRisk: 1, anomalies: 0 });

  const handleCalculateSafety = async () => {
    setLoading(true);
    const resp = await apiRequest('/api/ai/safety-score', {
      method: 'POST',
      body: JSON.stringify({
        telemetry: { heartRate: 85, movement: 'walking' },
        geofenceRisk: telemetryData.geofenceRisk,
        anomalies: telemetryData.anomalies
      })
    });
    if (resp.data && !resp.error) {
      setResult(resp.data);
    }
    setLoading(false);
  };

  // Real-time AI analytics state
  const [metrics, setMetrics] = useState({
    avgSafetyScore: 0,
    predictedRisks: 0,
    anomaliesDetected: 0,
    aiAccuracy: 0
  });
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    const [metricsRes, trendsRes, alertsRes] = await Promise.all([
      apiRequest('/api/ai/metrics'),
      apiRequest('/api/ai/trends'),
      apiRequest('/api/ai/alerts')
    ]);
    if (metricsRes.data && !metricsRes.error) setMetrics(metricsRes.data);
    if (trendsRes.data && !trendsRes.error) setTrends(trendsRes.data);
    if (alertsRes.data && !alertsRes.error) setAlerts(alertsRes.data);
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Analytics & Insights</h2>
        <p className="text-gray-600">Risk prediction, safety trends, and AI performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Avg Safety Score</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.avgSafetyScore}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Predicted Risks</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.predictedRisks}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Anomalies Detected</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.anomaliesDetected}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">AI Accuracy</p>
          <p className="text-3xl font-bold text-gray-900">{metrics.aiAccuracy}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Safety Score Calculator</h3>
            <p className="text-sm text-gray-600">Test AI safety score calculation</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Geofence Risk (1-10)</label>
              <input type="number" min="1" max="10" value={telemetryData.geofenceRisk} onChange={e => setTelemetryData(d => ({ ...d, geofenceRisk: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Anomalies Count</label>
              <input type="number" min="0" value={telemetryData.anomalies} onChange={e => setTelemetryData(d => ({ ...d, anomalies: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button onClick={handleCalculateSafety} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{loading ? 'Calculating...' : 'Calculate Safety Score'}</button>
            {result && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold">Safety Score: {result.safetyScore || 0}</div>
                {result.factors && (
                  <div className="text-sm text-gray-600 mt-1">Factors: Geofence Risk: {result.factors.geofenceRisk || 0}, Anomalies: {result.factors.anomalies || 0}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Alerts</h3>
            <p className="text-sm text-gray-600">Recent AI-generated alerts</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'high' ? 'text-red-700 bg-red-100' : alert.severity === 'medium' ? 'text-yellow-700 bg-yellow-100' : 'text-green-700 bg-green-100'
                    }`}>{alert.severity}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                  <div className="text-xs text-gray-500 mt-2">{alert.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Safety Trends (24 Hours)</h3>
          <p className="text-sm text-gray-600">Average safety scores over time</p>
        </div>
        <div className="p-6">
          <div className="h-32 flex items-end justify-between space-x-2">
            {trends.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full bg-blue-500 rounded-t`} style={{ height: `${(point.safety / 100) * 120}px` }}></div>
                <div className="text-xs text-gray-600 mt-2">{point.hour}</div>
                <div className="text-xs font-medium">{point.safety}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
