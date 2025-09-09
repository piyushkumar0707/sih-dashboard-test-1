import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  MapIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  HeartIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'User Management', href: '/users', icon: UsersIcon },
    { name: 'Tourist Monitoring', href: '/tourists', icon: MapIcon },
    { name: 'Incident Management', href: '/incidents', icon: ExclamationTriangleIcon },
    { name: 'AI Analytics', href: '/ai-analytics', icon: ChartBarIcon },
    { name: 'Blockchain Logs', href: '/blockchain', icon: CubeIcon },
    { name: 'System Health', href: '/system-health', icon: HeartIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">GE</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-white text-lg font-semibold">Travira</h1>
              <p className="text-gray-300 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon 
                      className={`
                        flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                      `} 
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-300 text-sm">System Online</span>
            </div>
            <div className="text-gray-400 text-xs mt-1">
              All services operational
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
