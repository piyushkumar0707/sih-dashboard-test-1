import React from 'react';

const Profile = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="admin" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="admin@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Change Password</label>
          <input type="password" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="New password" />
        </div>
        <button className="px-4 py-2 rounded-md bg-blue-600 text-white">Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;

