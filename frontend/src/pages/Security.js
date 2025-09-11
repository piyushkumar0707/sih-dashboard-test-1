import React, { useState } from 'react';
import { ShieldCheckIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const Security = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'New York, NY', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'New York, NY', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Firefox on macOS', location: 'San Francisco, CA', lastActive: '2 days ago', current: false },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Security Settings</h2>
      
      {/* Password Security */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium">Password Security</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input type="password" className="block w-full border-gray-300 rounded-md shadow-sm" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input type="password" className="block w-full border-gray-300 rounded-md shadow-sm" placeholder="Enter new password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input type="password" className="block w-full border-gray-300 rounded-md shadow-sm" placeholder="Confirm new password" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account with two-factor authentication.
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ComputerDesktopIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-medium">Active Sessions</h3>
        </div>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-sm">{session.device}</p>
                  {session.current && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Current Session
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{session.location} • Last active {session.lastActive}</p>
              </div>
              {!session.current && (
                <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Account Security Actions</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="font-medium text-sm">Download Account Data</div>
            <div className="text-xs text-gray-500">Get a copy of your account information</div>
          </button>
          <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 text-red-600">
            <div className="font-medium text-sm">Delete Account</div>
            <div className="text-xs text-red-500">Permanently delete your account and all data</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Security;
