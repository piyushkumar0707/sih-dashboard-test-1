import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { useAuth } from '../contexts/AuthContext';

// ─── colour coding by geofence type ──────────────────────────────────────────
const TYPE_STYLES = {
  safe_zone:        { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.18 },
  restricted_area:  { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.18 },
  high_risk:        { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.18 },
  tourist_attraction:{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.18 },
  emergency_zone:   { color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.18 },
};

const TYPE_LABELS = {
  safe_zone:         'Safe Zone',
  restricted_area:   'Restricted Area',
  high_risk:         'High Risk',
  tourist_attraction:'Tourist Attraction',
  emergency_zone:    'Emergency Zone',
};

// ─── Draw Controller (must be a child of MapContainer) ───────────────────────
function DrawController({ onShapeDrawn }) {
  const map = useMap();
  // stable ref to the callback so effect deps stay empty
  const onShapeDrawnRef = useRef(onShapeDrawn);
  useEffect(() => { onShapeDrawnRef.current = onShapeDrawn; });

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems, edit: false, remove: false },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: '#6366f1', fillOpacity: 0.3 },
        },
        circle: {
          shapeOptions: { color: '#6366f1', fillOpacity: 0.3 },
          showRadius: true,
          metric: true,
        },
        rectangle: false,
        polyline: false,
        circlemarker: false,
        marker: false,
      },
    });

    map.addControl(drawControl);

    const handleCreated = (e) => {
      const { layerType, layer } = e;

      // clear previous preview shape
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      if (layerType === 'polygon') {
        const latlngs = layer.getLatLngs()[0];
        const coords = latlngs.map(ll => [ll.lng, ll.lat]);
        coords.push(coords[0]); // close ring
        onShapeDrawnRef.current({
          shapeType: 'polygon',
          geometry: { type: 'Polygon', coordinates: [coords] },
        });
      } else if (layerType === 'circle') {
        const center = layer.getLatLng();
        onShapeDrawnRef.current({
          shapeType: 'circle',
          geometry: {
            type: 'Point',
            coordinates: [center.lng, center.lat],
            radius: Math.round(layer.getRadius()),
          },
        });
      }
    };

    map.on(L.Draw.Event.CREATED, handleCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      try { map.removeControl(drawControl); } catch (_) {}
      try { map.removeLayer(drawnItems); } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

// ─── A single rendered geofence layer ────────────────────────────────────────
function GeofenceLayer({ geofence, onDelete }) {
  const style = TYPE_STYLES[geofence.type] || TYPE_STYLES.safe_zone;
  const { geometry } = geofence;

  const popup = (
    <Popup>
      <div className="min-w-[180px]">
        <p className="font-semibold text-gray-800 text-sm">{geofence.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[geofence.type]}</p>
        <p className="text-xs text-gray-500">Risk Level: {geofence.riskLevel}/10</p>
        {geofence.description && (
          <p className="text-xs text-gray-500 mt-1">{geofence.description}</p>
        )}
        <button
          onClick={() => onDelete(geofence._id)}
          className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
        >
          Delete Geofence
        </button>
      </div>
    </Popup>
  );

  if (geometry.type === 'Polygon') {
    // GeoJSON polygon: [[[lng,lat], ...]] → Leaflet wants [[lat,lng], ...]
    const positions = geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    return (
      <Polygon positions={positions} pathOptions={style}>
        {popup}
      </Polygon>
    );
  }

  if (geometry.type === 'Point' && geometry.radius) {
    const [lng, lat] = geometry.coordinates;
    return (
      <Circle
        center={[lat, lng]}
        radius={geometry.radius}
        pathOptions={style}
      >
        {popup}
      </Circle>
    );
  }

  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  type: 'safe_zone',
  riskLevel: 5,
  alertEnabled: true,
  description: '',
};

export default function GeofenceManagement() {
  const { apiRequest } = useAuth();

  const [geofences, setGeofences]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [pendingShape, setPendingShape]   = useState(null); // shape drawn but not yet saved
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null); // { msg, type }
  const [error, setError]                 = useState('');

  // ── fetch geofences ─────────────────────────────────────────────────────────
  const fetchGeofences = useCallback(async () => {
    setLoading(true);
    const result = await apiRequest('/api/geofences');
    if (result.data && !result.error) {
      setGeofences(Array.isArray(result.data) ? result.data : []);
    } else {
      setError(result.error || 'Failed to load geofences');
    }
    setLoading(false);
  }, [apiRequest]);

  useEffect(() => { fetchGeofences(); }, [fetchGeofences]);

  // ── auto-dismiss toast ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── shape drawn callback ─────────────────────────────────────────────────────
  const handleShapeDrawn = useCallback((shapeData) => {
    setPendingShape(shapeData);
    setForm(EMPTY_FORM);
  }, []);

  // ── form submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pendingShape) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      riskLevel: Number(form.riskLevel),
      alertEnabled: form.alertEnabled,
      geometry: pendingShape.geometry,
      active: true,
    };

    const result = await apiRequest('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result.data && !result.error) {
      setGeofences(prev => [...prev, result.data]);
      setPendingShape(null);
      setForm(EMPTY_FORM);
      setToast({ msg: `Geofence "${form.name}" created successfully!`, type: 'success' });
    } else {
      setToast({ msg: result.error || 'Failed to create geofence', type: 'error' });
    }
    setSaving(false);
  };

  // ── delete geofence ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this geofence?')) return;
    const result = await apiRequest(`/api/geofences/${id}`, { method: 'DELETE' });
    if (!result.error) {
      setGeofences(prev => prev.filter(g => g._id !== id));
      setToast({ msg: 'Geofence deleted.', type: 'success' });
    } else {
      setToast({ msg: result.error || 'Failed to delete geofence', type: 'error' });
    }
  };

  // ── cancel panel ────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setPendingShape(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="relative flex flex-col h-full">

      {/* ── Toast notification ──────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white text-sm
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geofence Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Draw polygons or circles on the map to create geofence zones.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {loading ? 'Loading…' : `${geofences.length} active zone${geofences.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap gap-3">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="inline-block w-3 h-3 rounded-full border"
              style={{ background: TYPE_STYLES[key].fillColor, borderColor: TYPE_STYLES[key].color }}
            />
            {label}
          </span>
        ))}
      </div>

      {/* ── Main content: map + optional side panel ──────────────────────────── */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-[520px]">

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden shadow border border-gray-200">
          <MapContainer
            center={[28.6139, 77.2090]}
            zoom={13}
            style={{ height: '100%', width: '100%', minHeight: '520px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <DrawController onShapeDrawn={handleShapeDrawn} />

            {geofences.map(gf => (
              <GeofenceLayer key={gf._id} geofence={gf} onDelete={handleDelete} />
            ))}
          </MapContainer>
        </div>

        {/* Side panel — only visible when a shape has been drawn */}
        {pendingShape && (
          <div className="w-80 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">New Geofence</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {pendingShape.shapeType === 'circle'
                  ? `Circle · radius ${pendingShape.geometry.radius} m`
                  : 'Polygon'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 px-5 py-4 space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Zone Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Old City Restricted"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Zone Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Risk Level: <span className="font-semibold text-orange-600">{form.riskLevel}</span> / 10
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={form.riskLevel}
                  onChange={e => setForm(p => ({ ...p, riskLevel: e.target.value }))}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Alert Enabled */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Alert Enabled</label>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, alertEnabled: !p.alertEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full
                    transition-colors duration-200
                    ${form.alertEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                      ${form.alertEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional notes…"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : 'Create Zone'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Geofence table ───────────────────────────────────────────────────── */}
      {!loading && geofences.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Active Geofence Zones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Type', 'Risk Level', 'Alerts', 'Shape', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {geofences.map(gf => (
                  <tr key={gf._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium text-gray-800">{gf.name}</td>
                    <td className="px-4 py-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: TYPE_STYLES[gf.type]?.color || '#6b7280' }}
                      >
                        {TYPE_LABELS[gf.type] || gf.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-orange-600 font-semibold">{gf.riskLevel}/10</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs ${gf.alertEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {gf.alertEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 capitalize">
                      {gf.geometry?.type === 'Point' ? 'Circle' : gf.geometry?.type || '—'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(gf._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && geofences.length === 0 && !pendingShape && (
        <div className="mt-6 text-center py-10 text-gray-400 text-sm">
          No geofence zones yet. Use the draw tools on the map to create one.
        </div>
      )}
    </div>
  );
}
