import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MessageSquare, Save, User } from 'lucide-react';
import MessagingInterface from './MessagingInterface';

interface UserProfileProps {
  userId: string;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
    bio: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, initialData }) => {
  const [showMessaging, setShowMessaging] = useState(false);
  const [userData, setUserData] = useState(initialData || {
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialData) {
      fetchUserData();
    }
  }, [initialData]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      setIsEditing(false);
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload avatar');
      const { url } = await response.json();
      setUserData({ ...userData, avatarUrl: url });
    } catch (error) {
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  userData.name || 'Your Name'
                )}
              </h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  userData.email
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) =>
                      setUserData({ ...userData, phone: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  userData.phone || 'Add phone number'
                )}
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={userData.bio}
                  onChange={(e) =>
                    setUserData({ ...userData, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full border rounded-lg p-2"
                  placeholder="Tell us about yourself..."
                />
              </div>
            )}

            {!isEditing && userData.bio && (
              <p className="text-gray-600">{userData.bio}</p>
            )}
          </div>
        </div>

        {/* Contact Admin Button */}
        <div className="mt-6 border-t pt-6">
          <button
            onClick={() => setShowMessaging(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </button>
        </div>
      </div>

      {/* Messaging Interface */}
      {showMessaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <MessagingInterface
              userId={userId}
              adminId="admin-id" // Replace with actual admin ID
              onClose={() => setShowMessaging(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
