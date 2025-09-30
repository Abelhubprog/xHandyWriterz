import React from 'react';
import { UserProfile } from '@clerk/clerk-react';

export default function Profile() {
  return (
    <div className="min-h-[60vh] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow-sm p-2 sm:p-4">
        <UserProfile routing="path" path="/dashboard/profile" />
      </div>
    </div>
  );
}

