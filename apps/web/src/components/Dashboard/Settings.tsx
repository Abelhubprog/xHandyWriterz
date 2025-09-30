import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import database from '@/lib/d1Client';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import toast from 'react-hot-toast';

interface SettingsState {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  twoFactorAuth: boolean;
}

const Settings: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    darkMode: false,
    twoFactorAuth: false
  });

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
  const { data, error } = await database
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGSQL_ERROR') {
          throw error;
        }

        if (data) {
          setSettings({
            emailNotifications: data.email_notifications ?? true,
            smsNotifications: data.sms_notifications ?? false,
            marketingEmails: data.marketing_emails ?? true,
            darkMode: data.dark_mode ?? false,
            twoFactorAuth: data.two_factor_auth ?? false
          });
        }
      } catch (error) {
        toast.error('Failed to load your settings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle setting changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.checked
    });
  };

  // Save settings
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
  const { error } = await database
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: settings.emailNotifications,
          sms_notifications: settings.smsNotifications,
          marketing_emails: settings.marketingEmails,
          dark_mode: settings.darkMode,
          two_factor_auth: settings.twoFactorAuth,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Show login prompt if not authenticated
  if (isLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Settings - HandyWriterz</title>
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
              <p className="text-orange-700 mt-1">You need to be logged in to view your settings.</p>
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

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="md">
        <Helmet>
          <title>Settings - HandyWriterz</title>
        </Helmet>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Settings - HandyWriterz</title>
      </Helmet>

      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Settings
        </Typography>

        <Paper elevation={0} sx={{ p: 3, mt: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>

          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email notifications"
            />
          </Box>

          <Box mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  name="smsNotifications"
                  color="primary"
                />
              }
              label="SMS notifications"
            />
          </Box>

          <Box mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.marketingEmails}
                  onChange={handleChange}
                  name="marketingEmails"
                  color="primary"
                />
              }
              label="Marketing emails"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>

          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleChange}
                  name="darkMode"
                  color="primary"
                />
              }
              label="Dark mode"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Security
          </Typography>

          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={handleChange}
                  name="twoFactorAuth"
                  color="primary"
                />
              }
              label="Two-factor authentication"
            />
            {settings.twoFactorAuth && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Two-factor authentication is managed through your account settings.
              </Alert>
            )}
          </Box>

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
