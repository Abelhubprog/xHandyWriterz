import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import db from '@/lib/d1Client'; // Import as default

const Profile: React.FC = () => {
  const { isAuthenticated, userId, user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // Use Clerk's user object directly if available
        if (user) {
          setProfileData({
            id: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            imageUrl: user.imageUrl || '',
          });
          setLoading(false);
          return;
        }

        // Fallback to D1 query if needed (e.g., for additional data)
        // Optionally fetch extra profile data from your API if needed
        // Keeping D1 direct query disabled on client to avoid leakage
        // const { results } = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).all();
        // if (results.length > 0) setProfileData(results[0]); else setError('Profile not found');
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, userId, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div>Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div>Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profileData?.imageUrl} alt="Profile picture" />
            <AvatarFallback>
              {profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-2xl">
              {profileData?.firstName} {profileData?.lastName}
            </CardTitle>
            <CardDescription>{profileData?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">User ID</label>
              <p className="text-muted-foreground">{profileData?.id}</p>
            </div>
            {/* Add more profile fields as needed */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
