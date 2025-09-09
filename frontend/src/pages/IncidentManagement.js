import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const IncidentManagement = () => {
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', severity: 'all' });
  const [newIncident, setNewIncident] = useState({ type: '', location: '', severity: 'Low', touristId: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.severity !== 'all') params.append('severity', filters.severity);
    const result = await apiRequest(`/api/incidents${params.toString() ? `?${params.toString()}` : ''}`);
    if (result.data && !result.error) {
      setIncidents(result.data.incidents || []);
    } else {
      setError(result.error || 'Failed to fetch incidents');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.severity]);

  const filtered = useMemo(() => incidents, [incidents]);

  // Inline update for status and severity
  const handleUpdateIncident = async (id, updates) => {
    const result = await apiRequest(`/api/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (result.data && !result.error) {
      await fetchIncidents();
    } else {
      alert(result.error || 'Failed to update incident');
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setCreating(true);
    const result = await apiRequest('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(newIncident),
    });
    if (result.data && !result.error) {
      setNewIncident({ type: '', location: '', severity: 'Low', touristId: '', description: '' });
      await fetchIncidents();
    } else {
      alert(result.error || 'Failed to create incident');
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Management</h2>
          <p className="text-gray-600">Track incidents and manage their lifecycle</p>
        </div>
        <div className="flex items-center space-x-2">
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Monitoring</option>
          </select>
          <select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Severity</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button onClick={fetchIncidents} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Incidents</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : (
              <div className="space-y-3">
                {filtered.map(inc => (
                  <div key={inc.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{inc.type} <span className="text-gray-500">({inc.id})</span></div>
                      <select
                        value={inc.severity}
                        onChange={e => handleUpdateIncident(inc.id, { severity: e.target.value })}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          inc.severity === 'High' ? 'text-red-700 bg-red-100' : inc.severity === 'Medium' ? 'text-yellow-700 bg-yellow-100' : 'text-green-700 bg-green-100'
                        }`}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{inc.location} • Tourist: {inc.touristId || '-'}</div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
                      <span>Status:</span>
                      <select
                        value={inc.status}
                        onChange={e => handleUpdateIncident(inc.id, { status: e.target.value })}
                        className="border rounded px-1 py-0.5 text-xs"
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Monitoring</option>
                      </select>
                      <span>• Assigned: {inc.assignedOfficer || '—'} • {new Date(inc.createdAt).toLocaleString()}</span>
                    </div>
                    {inc.description && <div className="mt-2 text-sm text-gray-700">{inc.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Create Incident</h3>
          <form onSubmit={handleCreateIncident} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <input value={newIncident.type} onChange={e => setNewIncident(i => ({ ...i, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Location</label>
              <input value={newIncident.location} onChange={e => setNewIncident(i => ({ ...i, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Severity</label>
              <select value={newIncident.severity} onChange={e => setNewIncident(i => ({ ...i, severity: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tourist ID (optional)</label>
              <input value={newIncident.touristId} onChange={e => setNewIncident(i => ({ ...i, touristId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description</label>
              <textarea value={newIncident.description} onChange={e => setNewIncident(i => ({ ...i, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} />
            </div>
            <button type="submit" disabled={creating} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{creating ? 'Creating...' : 'Create Incident'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentManagement;
