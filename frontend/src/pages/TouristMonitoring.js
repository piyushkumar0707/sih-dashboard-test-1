import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import useSocket from '../hooks/useSocket';

// Custom tourist person icon — color-coded by safety score
const createTouristIcon = (safetyScore, status) => {
  const isHighRisk = status === 'high-risk' || safetyScore < 70;
  const isModerate = !isHighRisk && safetyScore < 85;
  const color = isHighRisk ? '#ef4444' : isModerate ? '#f97316' : '#22c55e';
  const ring  = isHighRisk ? '#fca5a5' : isModerate ? '#fdba74' : '#86efac';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <!-- drop shadow -->
      <ellipse cx="18" cy="42" rx="8" ry="3" fill="rgba(0,0,0,0.18)"/>
      <!-- pin body -->
      <path d="M18 2 C9.163 2 2 9.163 2 18 C2 28 18 42 18 42 C18 42 34 28 34 18 C34 9.163 26.837 2 18 2 Z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <!-- glow ring -->
      <circle cx="18" cy="18" r="12" fill="${ring}" opacity="0.4"/>
      <!-- person head -->
      <circle cx="18" cy="13" r="4" fill="white"/>
      <!-- person body -->
      <path d="M11 26 Q11 20 18 20 Q25 20 25 26" fill="white"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

const TouristMonitoring = () => {
  const { apiRequest } = useAuth();
  const { subscribe, unsubscribe } = useSocket();
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

    // Live location updates via WebSocket — no polling needed
    const handleLocationUpdate = (tourist) => {
      setTourists(prev =>
        prev.map(t => (t.id === tourist.id || t._id === tourist._id ? { ...t, ...tourist } : t))
      );
      setSummary(prev => prev ? { ...prev } : prev);
    };

    subscribe('tourist:location', handleLocationUpdate);
    return () => unsubscribe('tourist:location', handleLocationUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <Marker
                key={t.id}
                position={[t.location.lat, t.location.lng]}
                icon={createTouristIcon(t.safetyScore, t.status)}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>👤 {t.name}</div>
                    <div style={{ fontSize: 12, color: '#555' }}>ID: <code>{t.id}</code></div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      🛡️ Safety Score: <strong style={{ color: t.safetyScore >= 85 ? '#16a34a' : t.safetyScore >= 70 ? '#ea580c' : '#dc2626' }}>{t.safetyScore}</strong>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                      📍 {t.location.lat.toFixed(4)}, {t.location.lng.toFixed(4)}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: t.status === 'high-risk' ? '#fee2e2' : '#dcfce7',
                        color: t.status === 'high-risk' ? '#dc2626' : '#16a34a'
                      }}>{t.status}</span>
                    </div>
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
