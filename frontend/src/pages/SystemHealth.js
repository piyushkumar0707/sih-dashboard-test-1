import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const StatusDot = ({ status }) => {
  const color = status === 'online' ? 'bg-green-400' : status === 'warning' ? 'bg-yellow-400' : 'bg-red-400';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
};

const SystemHealth = () => {
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [health, setHealth] = useState({ overall: 'unknown', services: [], timestamp: null });

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    const result = await apiRequest('/api/health');
    if (result.data && !result.error) {
      setHealth(result.data);
    } else {
      setError(result.error || 'Failed to fetch system health');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 60000); // Poll every 60 seconds instead of 30
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Monitoring</h2>
          <p className="text-gray-600">Real-time status across backend, AI services, DB, and blockchain</p>
        </div>
        <button onClick={fetchHealth} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Refresh</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Overall Status</p>
          <p className="mt-2 text-3xl font-bold capitalize">
            {health.overall === 'healthy' ? (
              <span className="text-green-600">Healthy</span>
            ) : (
              <span className="text-yellow-600">Degraded</span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Updated {health.timestamp ? new Date(health.timestamp).toLocaleString() : ''}</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Services</h3>
            <p className="text-sm text-gray-600">Uptime and response times</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                {health.services.map(svc => (
                  <div key={svc.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StatusDot status={svc.status} />
                      <span className="text-sm font-medium text-gray-900">
                        {svc.name}
                        {svc.optional && <span className="ml-2 text-xs text-gray-400">(optional)</span>}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-x-4">
                      <span>Uptime: {svc.uptime}</span>
                      {svc.responseTime && svc.responseTime !== 'N/A' && <span>RT: {svc.responseTime}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
