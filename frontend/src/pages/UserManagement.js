import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const { apiRequest } = useAuth();
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      email: 'admin@guardianeagle.com',
      role: 'admin',
      status: 'active',
      lastActive: '2024-01-09 14:30',
      verified: true,
      joinedDate: '2024-01-01',
      location: 'Delhi, India'
    },
    {
      id: 2,
      username: 'officer1',
      email: 'officer1@tourism.gov',
      role: 'officer',
      status: 'pending',
      lastActive: '2024-01-09 12:15',
      verified: false,
      joinedDate: '2024-01-08',
      location: 'Mumbai, India'
    },
    {
      id: 3,
      username: 'tourist_john',
      email: 'john.doe@email.com',
      role: 'tourist',
      status: 'active',
      lastActive: '2024-01-09 16:45',
      verified: true,
      joinedDate: '2024-01-09',
      location: 'New York, USA'
    },
    {
      id: 4,
      username: 'officer2',
      email: 'officer2@police.gov',
      role: 'officer',
      status: 'suspended',
      lastActive: '2024-01-08 09:20',
      verified: true,
      joinedDate: '2024-01-05',
      location: 'Bangalore, India'
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'tourist',
    password: ''
  });

  // Fetch users from API
  const fetchUsers = async () => {
    const result = await apiRequest('/api/users');
    if (result.data && !result.error) {
      setUsers(result.data);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleApproveUser = async (userId) => {
    const result = await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'active' })
    });
    if (result.data && !result.error) {
      setUsers(users.map(user => 
        user.id === userId || user._id === userId ? { ...user, status: 'active', verified: true } : user
      ));
    } else {
      alert(result.error || 'Failed to approve user');
    }
  };

  const handleRejectUser = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      const result = await apiRequest(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (result.data && !result.error) {
        setUsers(users.filter(user => user.id !== userId && user._id !== userId));
      } else {
        alert(result.error || 'Failed to reject user');
      }
    }
  };

  const handleSuspendUser = async (userId) => {
    const result = await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'suspended' })
    });
    if (result.data && !result.error) {
      setUsers(users.map(user => 
        user.id === userId || user._id === userId ? { ...user, status: 'suspended' } : user
      ));
    } else {
      alert(result.error || 'Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    const result = await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'active' })
    });
    if (result.data && !result.error) {
      setUsers(users.map(user => 
        user.id === userId || user._id === userId ? { ...user, status: 'active' } : user
      ));
    } else {
      alert(result.error || 'Failed to activate user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const result = await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole })
    });
    if (result.data && !result.error) {
      setUsers(users.map(user => 
        user.id === userId || user._id === userId ? { ...user, role: newRole } : user
      ));
    } else {
      alert(result.error || 'Failed to update role');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }
    const result = await apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify(newUser)
    });
    if (result.data && !result.error) {
      await fetchUsers(); // Refresh the user list
      setNewUser({ username: '', email: '', role: 'tourist', password: '' });
      setShowAddModal(false);
    } else {
      alert(result.error || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const result = await apiRequest(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (result.data && !result.error) {
        setUsers(users.filter(user => user.id !== userId && user._id !== userId));
      } else {
        alert(result.error || 'Failed to delete user');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-700 bg-purple-100';
      case 'officer': return 'text-blue-700 bg-blue-100';
      case 'tourist': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'suspended': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    officers: users.filter(u => u.role === 'officer').length,
    tourists: users.filter(u => u.role === 'tourist').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-gray-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-purple-900">{stats.admins}</p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-blue-900">{stats.officers}</p>
              <p className="text-sm text-gray-600">Officers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-green-900">{stats.tourists}</p>
              <p className="text-sm text-gray-600">Tourists</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <XMarkIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-red-900">{stats.suspended}</p>
              <p className="text-sm text-gray-600">Suspended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
              <option value="tourist">Tourist</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id || user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.verified && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">Verified</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id || user._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-none ${getRoleColor(user.role)}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="officer">Officer</option>
                      <option value="tourist">Tourist</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : user.lastActive || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.location || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveUser(user.id || user._id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Approve"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id || user._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Reject"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleSuspendUser(user.id || user._id)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                        title="Suspend"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        onClick={() => handleActivateUser(user.id || user._id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Activate"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id || user._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="tourist">Tourist</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
