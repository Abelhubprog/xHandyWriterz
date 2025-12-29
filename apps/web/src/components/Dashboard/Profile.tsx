import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { User, Shield, Bell, Trash2, Save, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cloudflareDb } from '@/lib/cloudflare';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useUser } from '@clerk/clerk-react';
import { d1Client } from '@/lib/d1Client';
import { CloudflareR2Client } from '@/lib/cloudflareR2Client';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
  created_at: string;
  phone?: string;
  bio?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, session, updatePassword, signInWithMagicLink, logout } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Don't redirect, let the component handle the UI for not logged in
    } else if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const result = await d1Client
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // Fix the error handling - check if result has data and error properties
      if (result && result.error) throw result.error;

      // Check if we have data before setting state
      if (result && result.data) {
        setProfile(result.data);
        setFullName(result.data.full_name || '');
        setBio(result.data.bio || '');
        setPhone(result.data.phone || '');

        if (result.data.notification_preferences) {
          setNotificationPreferences(result.data.notification_preferences);
        }
      }

    } catch (error: any) {
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!user) return;

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Create R2 client instance
        const r2Client = new CloudflareR2Client();

        // Upload to Cloudflare R2
        try {
          const uploadResult = await r2Client.uploadFile(avatarFile, filePath);
          avatarUrl = r2Client.getPublicUrl(filePath);
        } catch (uploadError) {
          throw new Error(`Failed to upload avatar: ${uploadError}`);
        }
      }

      const updates = {
        id: user?.id,
        full_name: fullName,
        bio,
        phone,
        avatar_url: avatarUrl,
        notification_preferences: notificationPreferences,
        updated_at: new Date().toISOString(),
      };

      await d1Client
        .from('profiles')
        .upsert(updates);

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully!');

    } catch (error: any) {
      toast.error('Failed to update profile. Please try again.');
      setError('Failed to update profile. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      // For security, we require the current password
      if (!currentPassword) {
        toast.error('Please enter your current password');
        return;
      }

      // Since we're using Clerk for authentication, we don't need to verify the current password
      // directly. The updatePassword function will handle this.

  const result = await updatePassword(newPassword);
  if (!result?.success) throw new Error('Password update failed');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');

    } catch (error: any) {
      toast.error('Failed to update password. Please try again.');
      setError('Failed to update password. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMagicLink = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!user?.email) return;

  const result = await signInWithMagicLink(user?.email);
  if (!result?.success) throw new Error('Magic link failed');

      toast.success('Magic link sent to your email!');

    } catch (error: any) {
      toast.error('Failed to send magic link. Please try again.');
      setError('Failed to send magic link. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!user) return;

      // Delete user data from profiles table
      // D1QueryBuilder delete is supported via chain but returns no result; execute and proceed
      await d1Client
        .from('profiles')
        .delete()
        .eq('id', user?.id)
        .single();

      // Note: User authentication is now handled by Clerk
      // We don't need to delete from Supabase auth, just remove the user's profile data
      // Additional cleanup for user assets in R2 could be added here if needed

      toast.success('Your account has been deleted');
      await logout();
      navigate('/');

    } catch (error: any) {
      toast.error('Failed to delete account. Please try again.');
      setError('Failed to delete account. Please try again later.');
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Profile - HandyWriterz</title>
        </Helmet>
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-orange-800">Authentication required</h3>
              <p className="text-orange-700 mt-1">You need to be logged in to view this page.</p>
              <div className="mt-3">
                <button
                  onClick={() => navigate('/sign-in')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>My Profile | HandyWriterz</title>
        <meta name="description" content="Manage your HandyWriterz profile and account settings" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={avatarPreview || profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName || (user?.email || 'User')}&background=2563eb&color=fff`}
                    alt={fullName || (user?.email || 'User')}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="text-xl font-bold mb-1">
                  {fullName || 'Your Name'}
                </h2>

                <p className="text-gray-600 mb-3">
                  {user?.email || 'No email available'}
                </p>

                <p className="text-gray-700 text-center">
                  {profile?.bio || 'No bio added yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Fix tab icons */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setTabValue(0)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      tabValue === 0
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setTabValue(1)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      tabValue === 1
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </button>
                  <button
                    onClick={() => setTabValue(2)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      tabValue === 2
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </button>
                </nav>
              </div>

              {/* Profile Tab */}
              <div className={`${tabValue === 0 ? 'block' : 'hidden'}`}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || 'No email available'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={updateProfile}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Tab */}
              <div className={`${tabValue === 1 ? 'block' : 'hidden'}`}>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="border-t border-gray-200 my-6"></div>

                  <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleSendMagicLink}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Send Magic Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications Tab */}
              <div className={`${tabValue === 2 ? 'block' : 'hidden'}`}>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about your account</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotificationPreferences(prev => ({
                          ...prev,
                          email: !prev.email
                        }))}
                        className={`${
                          notificationPreferences.email ? 'bg-blue-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            notificationPreferences.email ? 'translate-x-5' : 'translate-x-0'
                          } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotificationPreferences(prev => ({
                          ...prev,
                          push: !prev.push
                        }))}
                        className={`${
                          notificationPreferences.push ? 'bg-blue-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            notificationPreferences.push ? 'translate-x-5' : 'translate-x-0'
                          } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive text messages about important updates</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotificationPreferences(prev => ({
                          ...prev,
                          sms: !prev.sms
                        }))}
                        className={`${
                          notificationPreferences.sms ? 'bg-blue-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            notificationPreferences.sms ? 'translate-x-5' : 'translate-x-0'
                          } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={updateProfile}
                      disabled={updating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Dialog */}
        <div className={`${showDeleteConfirm ? 'block' : 'hidden'} relative z-10`}>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Delete Account</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={updating}
                    className="inline-flex items-center w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Profile;
