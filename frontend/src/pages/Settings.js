import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    ai: {
      safetyThreshold: 70,
      anomalyThreshold: 5,
      alertEnabled: true,
      autoReporting: false
    },
    geofence: {
      defaultRadius: 100,
      alertOnExit: true,
      trackingInterval: 30
    },
    system: {
      refreshInterval: 30,
      maxUsers: 1000,
      dataRetention: 90,
      debugMode: false
    },
    blockchain: {
      network: 'polygon-testnet',
      gasLimit: 500000,
      enabled: true
    }
  });

  const [activeTab, setActiveTab] = useState('ai');
  const [saved, setSaved] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'ai', label: 'AI Settings' },
    { id: 'geofence', label: 'Geofencing' },
    { id: 'system', label: 'System' },
    { id: 'blockchain', label: 'Blockchain' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Configure AI thresholds, geofences, and system parameters</p>
        </div>
        <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">AI Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Safety Threshold (%)</label>
                  <input type="number" min="0" max="100" value={settings.ai.safetyThreshold} onChange={e => updateSetting('ai', 'safetyThreshold', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Below this score triggers high-risk alerts</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Anomaly Threshold</label>
                  <input type="number" min="1" value={settings.ai.anomalyThreshold} onChange={e => updateSetting('ai', 'anomalyThreshold', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Number of anomalies to trigger alert</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={settings.ai.alertEnabled} onChange={e => updateSetting('ai', 'alertEnabled', e.target.checked)} className="mr-2" />
                  <label className="text-sm text-gray-700">Enable AI Alerts</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={settings.ai.autoReporting} onChange={e => updateSetting('ai', 'autoReporting', e.target.checked)} className="mr-2" />
                  <label className="text-sm text-gray-700">Auto Generate Reports</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'geofence' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Geofencing Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Default Radius (meters)</label>
                  <input type="number" min="10" value={settings.geofence.defaultRadius} onChange={e => updateSetting('geofence', 'defaultRadius', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tracking Interval (seconds)</label>
                  <input type="number" min="5" value={settings.geofence.trackingInterval} onChange={e => updateSetting('geofence', 'trackingInterval', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={settings.geofence.alertOnExit} onChange={e => updateSetting('geofence', 'alertOnExit', e.target.checked)} className="mr-2" />
                  <label className="text-sm text-gray-700">Alert on Geofence Exit</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Refresh Interval (seconds)</label>
                  <input type="number" min="5" value={settings.system.refreshInterval} onChange={e => updateSetting('system', 'refreshInterval', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Users</label>
                  <input type="number" min="1" value={settings.system.maxUsers} onChange={e => updateSetting('system', 'maxUsers', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Data Retention (days)</label>
                  <input type="number" min="1" value={settings.system.dataRetention} onChange={e => updateSetting('system', 'dataRetention', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={settings.system.debugMode} onChange={e => updateSetting('system', 'debugMode', e.target.checked)} className="mr-2" />
                  <label className="text-sm text-gray-700">Debug Mode</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Blockchain Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Network</label>
                  <select value={settings.blockchain.network} onChange={e => updateSetting('blockchain', 'network', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="polygon-testnet">Polygon Testnet</option>
                    <option value="polygon-mainnet">Polygon Mainnet</option>
                    <option value="ethereum-testnet">Ethereum Testnet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Gas Limit</label>
                  <input type="number" min="21000" value={settings.blockchain.gasLimit} onChange={e => updateSetting('blockchain', 'gasLimit', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={settings.blockchain.enabled} onChange={e => updateSetting('blockchain', 'enabled', e.target.checked)} className="mr-2" />
                  <label className="text-sm text-gray-700">Enable Blockchain</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
