import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const TouristMonitoring = () => {
  const { apiRequest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tourists, setTourists] = useState([]);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState('');

  const fetchTourists = async () => {
    setLoading(true);
    setError('');
    const result = await apiRequest('/api/tourists');
    if (result.data && !result.error) {
      setTourists(result.data.tourists || []);
      setSummary(result.data.summary || null);
    } else {
      setError(result.error || 'Failed to fetch tourists');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTourists();
    const id = setInterval(fetchTourists, 30000);
    return () => clearInterval(id);
  }, [fetchTourists]);

  const filtered = useMemo(() => {
    if (!query) return tourists;
    return tourists.filter(t =>
      (t.id || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.name || '').toLowerCase().includes(query.toLowerCase())
    );
  }, [tourists, query]);

  const avgSafety = summary?.averageSafetyScore ?? Math.round((tourists.reduce((s, t) => s + (t.safetyScore || 0), 0) / Math.max(1, tourists.length)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{summary?.active ?? tourists.filter(t => t.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active Tourists</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{avgSafety}%</p>
              <p className="text-sm text-gray-600">Avg Safety Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{summary?.highRisk ?? tourists.filter(t => (t.safetyScore||0) < 70).length}</span>
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">High Risk</p>
              <p className="text-sm text-gray-600">Tourists</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tourists</h3>
            <p className="text-sm text-gray-600">Live locations and safety status</p>
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID or name..."
            className="w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Safety Score</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-t border-gray-100">
                      <td className="py-2 pr-4 font-mono">{t.id}</td>
                      <td className="py-2 pr-4">{t.name || '-'}</td>
                      <td className="py-2 pr-4">{t.location ? `${t.location.lat.toFixed(4)}, ${t.location.lng.toFixed(4)}` : '-'}</td>
                      <td className="py-2 pr-4">{t.safetyScore}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === 'high-risk' ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Real Map Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Tourist Map</h3>
          <p className="text-sm text-gray-600">Live locations visualized on OpenStreetMap</p>
        </div>
        <div className="h-96 w-full">
          <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {tourists.filter(t => t.location).map(t => (
              <Marker key={t.id} position={[t.location.lat, t.location.lng]}>
                <Popup>
                  <div>
                    <strong>{t.name}</strong><br />
                    ID: {t.id}<br />
                    Safety Score: {t.safetyScore}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default TouristMonitoring;
