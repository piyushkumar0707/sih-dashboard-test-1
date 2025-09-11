import React from 'react';

const ActivityLog = () => {
  const activities = [
    { id: 1, action: 'User Login', timestamp: '2024-01-15 09:30:25', ip: '192.168.1.100', status: 'Success' },
    { id: 2, action: 'Profile Updated', timestamp: '2024-01-15 08:45:12', ip: '192.168.1.100', status: 'Success' },
    { id: 3, action: 'Password Changed', timestamp: '2024-01-14 16:20:33', ip: '192.168.1.100', status: 'Success' },
    { id: 4, action: 'Failed Login Attempt', timestamp: '2024-01-14 14:15:08', ip: '203.0.113.15', status: 'Failed' },
    { id: 5, action: 'User Logout', timestamp: '2024-01-14 18:30:45', ip: '192.168.1.100', status: 'Success' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'Success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
