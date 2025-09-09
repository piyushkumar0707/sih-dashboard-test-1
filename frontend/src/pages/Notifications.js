import React, { useState } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'High-risk tourist detected', message: 'Tourist T-003 in Zone A requires immediate attention', time: '2 min ago', read: false, priority: 'high' },
    { id: 2, type: 'incident', title: 'New incident reported', message: 'Medical emergency at Heritage Site B', time: '15 min ago', read: false, priority: 'high' },
    { id: 3, type: 'system', title: 'System maintenance complete', message: 'All services are back online', time: '1 hour ago', read: true, priority: 'low' },
    { id: 4, type: 'info', title: 'Daily report available', message: 'Tourist safety report for today is ready', time: '3 hours ago', read: true, priority: 'medium' },
    { id: 5, type: 'warning', title: 'Weather alert', message: 'Heavy rain expected in tourist areas', time: '5 hours ago', read: false, priority: 'medium' }
  ]);
  const [filter, setFilter] = useState('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');

  const markAsRead = (id) => {
    setNotifications(notifs => notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifs => notifs.filter(n => n.id !== id));
  };

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    const newNotif = {
      id: Date.now(),
      type: broadcastType,
      title: `Broadcast: ${broadcastType}`,
      message: broadcastMessage,
      time: 'just now',
      read: false,
      priority: broadcastType === 'alert' ? 'high' : broadcastType === 'warning' ? 'medium' : 'low'
    };
    setNotifications(notifs => [newNotif, ...notifs]);
    setBroadcastMessage('');
  };

  const filteredNotifications = filter === 'all' ? notifications : notifications.filter(n => n.read === (filter === 'read'));

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert': return 'text-red-700 bg-red-100';
      case 'warning': return 'text-yellow-700 bg-yellow-100';
      case 'incident': return 'text-orange-700 bg-orange-100';
      case 'system': return 'text-blue-700 bg-blue-100';
      case 'info': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    high: notifications.filter(n => n.priority === 'high').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-600">Manage alerts and broadcast messages</p>
        </div>
        <div className="flex items-center space-x-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total Notifications</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Unread</p>
          <p className="text-3xl font-bold text-gray-900">{stats.unread}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">High Priority</p>
          <p className="text-3xl font-bold text-gray-900">{stats.high}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredNotifications.map(notif => (
              <div key={notif.id} className={`p-4 border-l-4 ${getPriorityColor(notif.priority)} ${!notif.read ? 'bg-blue-50' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notif.type)}`}>{notif.type}</span>
                      {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <h4 className="font-medium text-gray-900">{notif.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notif.read && (
                      <button onClick={() => markAsRead(notif.id)} className="text-blue-600 hover:text-blue-800 text-xs">Mark Read</button>
                    )}
                    <button onClick={() => deleteNotification(notif.id)} className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Broadcast Message</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select value={broadcastType} onChange={e => setBroadcastType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Message</label>
              <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={4} placeholder="Enter broadcast message..." />
            </div>
            <button onClick={handleBroadcast} disabled={!broadcastMessage.trim()} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Send Broadcast</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
