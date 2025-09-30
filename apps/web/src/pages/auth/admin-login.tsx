import React from 'react';

// Admin login is handled by Cloudflare Access protecting the Strapi admin surface
// This page just explains the flow and provides a link to the protected admin dashboard.

const AdminLogin: React.FC = () => {
  const adminUrl = '/services/admin';
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Admin sign-in</h1>
        <p className="text-gray-600 mb-6">
          Admin dashboard is protected by Cloudflare Access. Click the button below to continue.
        </p>
        <a href={adminUrl} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Continue to Admin Dashboard
        </a>
        <p className="text-xs text-gray-500 mt-4">
          You may be asked to authenticate with your organization identity provider.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
