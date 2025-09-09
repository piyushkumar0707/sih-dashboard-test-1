import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { apiRequest } = useAuth();

  const [stats, setStats] = useState({
    activeTourists: 245,
    openIncidents: 7,
    avgSafetyScore: 87,
    officersOnDuty: 32,
    highRiskAreas: 3,
    incidentsToday: 12,
    systemUptime: '99.8%',
    responseTime: '2.3 min'
  });

  const [recentIncidents, setRecentIncidents] = useState([]);

  const [systemHealth, setSystemHealth] = useState([]);

  useEffect(() => {
    // Fetch dashboard stats, incidents, and system health on mount
    const fetchDashboardStats = async () => {
      const result = await apiRequest('/api/dashboard/stats');
      if (result.data && !result.error) {
        setStats(result.data);
      }
    };
    const fetchIncidents = async () => {
      const result = await apiRequest('/api/incidents');
      if (result.data && !result.error && result.data.incidents) {
        // Add a 'time' field for display (e.g., using createdAt)
        setRecentIncidents(result.data.incidents.map(inc => ({
          ...inc,
          time: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : ''
        })));
      }
    };
    const fetchSystemHealth = async () => {
      const result = await apiRequest('/api/health');
      if (result.data && !result.error && result.data.services) {
        setSystemHealth(result.data.services.map(s => ({
          service: s.name,
          status: s.status,
          uptime: s.uptime
        })));
      }
    };
    fetchDashboardStats();
    fetchIncidents();
    fetchSystemHealth();
    // Optionally, set up polling for real-time updates
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchIncidents();
      fetchSystemHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [apiRequest]);

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Monitoring': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Tourists"
          value={stats.activeTourists.toLocaleString()}
          change="+12 from yesterday"
          changeType="positive"
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Open Incidents"
          value={stats.openIncidents}
          change="-3 from yesterday"
          changeType="positive"
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
        />
        <StatCard
          title="Avg Safety Score"
          value={stats.avgSafetyScore + '%'}
          change="+2.1% this week"
          changeType="positive"
          icon={ShieldCheckIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Officers on Duty"
          value={stats.officersOnDuty}
          icon={MapPinIcon}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
            <p className="text-sm text-gray-600">Latest safety incidents requiring attention</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{incident.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>ID: {incident.id}</span>
                      <span>{incident.location}</span>
                      <span>Tourist: {incident.tourist}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {incident.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Incidents →
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <p className="text-sm text-gray-600">Real-time service status</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemHealth.map((service) => (
                <div key={service.service} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'online' ? 'bg-green-400' : 
                      service.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{service.service}</span>
                  </div>
                  <span className="text-xs text-gray-500">{service.uptime}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">System Operational</p>
                  <p className="text-xs text-green-700">All critical services running normally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Common administrative tasks</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">Add New User</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">Create Incident</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <MapPinIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">Update Geofences</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
