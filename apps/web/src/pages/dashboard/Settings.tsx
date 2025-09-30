import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="darkMode"
            className="rounded"
          />
          <label htmlFor="darkMode">Dark mode</label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <p className="text-gray-600 mb-4">
          Manage your phone number and billing inside your Profile panel.
        </p>
        <a
          href="/dashboard/profile"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Open Profile
        </a>
      </div>
    </div>
  );
};

export default Settings;
