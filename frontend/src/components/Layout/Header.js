import React, { useState } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, text: 'High-risk tourist detected in Zone A', type: 'alert', time: '2 min ago' },
    { id: 2, text: 'New incident reported', type: 'warning', time: '5 min ago' },
    { id: 3, text: 'System backup completed', type: 'info', time: '1 hour ago' },
  ]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle(window.location.pathname)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {getPageDescription(window.location.pathname)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tourists, incidents..."
              className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative">
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8" />
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role} Account</div>
                </div>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile Settings
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Activity Log
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Security
                </button>
                <div className="border-t border-gray-100 mt-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard Overview',
    '/users': 'User Management',
    '/tourists': 'Tourist Safety Monitoring',
    '/incidents': 'Incident Management',
    '/ai-analytics': 'AI Analytics & Insights',
    '/blockchain': 'Blockchain Credentials',
    '/system-health': 'System Health Monitoring',
    '/reports': 'Reports & Analytics',
    '/notifications': 'Notification Center',
    '/settings': 'System Configuration',
  };
  return titles[pathname] || 'Travira';
};

const getPageDescription = (pathname) => {
  const descriptions = {
    '/dashboard': 'Real-time overview of tourist safety operations',
    '/users': 'Manage users, roles, and access permissions',
    '/tourists': 'Monitor tourist locations and safety scores',
    '/incidents': 'Track and manage safety incidents',
    '/ai-analytics': 'AI-powered insights and predictive analytics',
    '/blockchain': 'View credential logs and blockchain activity',
    '/system-health': 'Monitor system performance and health',
    '/reports': 'Generate and export analytical reports',
    '/notifications': 'Manage alerts and communication',
    '/settings': 'Configure system parameters and preferences',
  };
  return descriptions[pathname] || 'Admin dashboard for tourist safety management';
};

export default Header;
