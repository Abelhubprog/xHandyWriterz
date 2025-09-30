import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MessageSquare, Save, User } from 'lucide-react';
import MessagingInterface from './MessagingInterface';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createToaster } from "@/components/ui/use-toast";

interface UserData {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
}

interface UserProfileProps {
  userId: string;
  initialData?: UserData;
  onProfileUpdate?: (data: UserData) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  initialData,
  onProfileUpdate 
}) => {
  const { toast } = useToast();
  const [showMessaging, setShowMessaging] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>(initialData || {
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
  }, [initialData, userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      setError('Failed to load user profile');
      toaster.create({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      onProfileUpdate?.(updatedData);
      
      toaster.create({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      setError('Failed to update profile');
      toaster.create({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
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
      setUserData(prev => ({ ...prev, avatarUrl: url }));
      
      toaster.create({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error && !userData.name) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchUserData}>Retry</Button>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-full overflow-hidden bg-gray-100"
              aria-label="Profile picture"
            >
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={`${userData.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <Button size="icon" variant="secondary" className="rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  aria-label="Upload profile picture"
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                {isEditing ? (
                  <Input
                    type="text"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your name"
                    aria-label="Name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">
                    {userData.name || 'Your Name'}
                  </h1>
                )}
              </div>
              <Button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={saving}
                variant={isEditing ? "default" : "outline"}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </>
                ) : (
                  'Edit Profile'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {isEditing ? (
                    <Input
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData(prev => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="Email address"
                      aria-label="Email"
                    />
                  ) : (
                    <span>{userData.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData(prev => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="Phone number"
                      aria-label="Phone"
                    />
                  ) : (
                    <span>{userData.phone || 'Add phone number'}</span>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    value={userData.bio}
                    onChange={(e) =>
                      setUserData(prev => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              ) : (
                userData.bio && <p className="text-gray-600">{userData.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support Button */}
        <div className="mt-6 border-t pt-6">
          <Button
            onClick={() => setShowMessaging(true)}
            className="w-full"
            variant="secondary"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Contact Support
          </Button>
        </div>
      </CardContent>

      {/* Messaging Interface */}
      {showMessaging && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <MessagingInterface
              userId={userId}
              adminId="admin-id"
              onClose={() => setShowMessaging(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserProfile;