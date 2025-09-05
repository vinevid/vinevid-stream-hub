import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Settings, Heart, Star, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  theme_preference: string;
  notifications_enabled: boolean;
}

interface UserStats {
  watchlistCount: number;
  ratingsCount: number;
  watchTimeMinutes: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ watchlistCount: 0, ratingsCount: 0, watchTimeMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [themePreference, setThemePreference] = useState('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
    fetchStats();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
        setThemePreference(data.theme_preference || 'system');
        setNotificationsEnabled(data.notifications_enabled);
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch watchlist count
      const { count: watchlistCount } = await supabase
        .from('user_watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch ratings count
      const { count: ratingsCount } = await supabase
        .from('video_ratings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch watch history count (approximate watch time)
      const { count: watchHistoryCount } = await supabase
        .from('user_watch_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        watchlistCount: watchlistCount || 0,
        ratingsCount: ratingsCount || 0,
        watchTimeMinutes: (watchHistoryCount || 0) * 45, // Estimate 45 minutes per episode
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || null,
        theme_preference: themePreference,
        notifications_enabled: notificationsEnabled,
      };

      const { error } = profile
        ? await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', user.id)
        : await supabase
            .from('user_profiles')
            .insert(profileData);

      if (error) throw error;

      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
            <div className="w-48 h-4 bg-muted rounded mx-auto" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>My Profile | VineVid</title>
        <meta name="description" content="Manage your VineVid profile and preferences" />
        <link rel="canonical" href={`${window.location.origin}/profile`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {profile?.display_name ? getInitials(profile.display_name) : <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold mb-2">
                      {profile?.display_name || 'User'}
                    </h1>
                    <p className="text-muted-foreground mb-4">{user.email}</p>
                    
                    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>Watchlist</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.watchlistCount}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4" />
                          <span>Ratings</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.ratingsCount}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Watch Time</span>
                        </div>
                        <div className="text-2xl font-bold">{Math.round(stats.watchTimeMinutes / 60)}h</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link to="/watchlist">
                        <Heart className="mr-2 h-4 w-4" />
                        Watchlist
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new episodes and features
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                  
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Profile;