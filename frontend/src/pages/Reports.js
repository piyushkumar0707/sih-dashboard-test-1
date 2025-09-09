import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { apiRequest } = useAuth();
  const [touristId, setTouristId] = useState('');
  const [alert, setAlert] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const resp = await apiRequest('/api/ai/generate-report', {
      method: 'POST',
      body: JSON.stringify({ touristId, alert, location })
    });
    if (resp.data && !resp.error) {
      setResult(resp.data);
    } else {
      setError(resp.error || 'Failed to generate report');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">Generate AI-assisted incident reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
          <form onSubmit={handleGenerate} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tourist ID</label>
              <input value={touristId} onChange={e => setTouristId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Alert</label>
              <input value={alert} onChange={e => setAlert(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">{loading ? 'Generating...' : 'Generate Report'}</button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          <div className="mt-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {result ? (
              <div className="space-y-2 text-sm">
                <div className="text-green-700">{result.message}</div>
                <div className="font-mono">Report ID: {result.reportId}</div>
                <div className="text-gray-700">Download URL: <span className="font-mono">{result.downloadUrl}</span></div>
              </div>
            ) : (
              <div className="text-gray-500">No report generated yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
