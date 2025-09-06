import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VideoCard } from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface WatchlistVideo {
  id: string;
  video_id: string;
  created_at: string;
  videos: {
    id: string;
    title: string;
    poster_url?: string;
    year?: number;
    categories: { name: string };
    video_downloads: Array<{ label: string; sort_order: number }>;
  };
}

const fetchWatchlist = async (userId: string): Promise<WatchlistVideo[]> => {
  const { data, error } = await supabase
    .from('user_watchlist')
    .select(`
      id,
      video_id,
      created_at,
      videos:video_id (
        id,
        title,
        poster_url,
        year,
        categories:category_id (name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Fetch video downloads separately for each video
  if (data && data.length > 0) {
    const videoIds = data.map(item => item.videos.id);
    const { data: downloads } = await supabase
      .from('video_downloads')
      .select('video_id, label, sort_order')
      .in('video_id', videoIds);

    // Merge downloads with videos
    const watchlistWithDownloads = data.map(item => ({
      ...item,
      videos: {
        ...item.videos,
        video_downloads: downloads?.filter(d => d.video_id === item.videos.id) || []
      }
    }));

    return watchlistWithDownloads;
  }
  
  // Handle empty data case
  return data?.map(item => ({
    ...item,
    videos: {
      ...item.videos,
      video_downloads: []
    }
  })) || [];
};

const Downloads = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();

  const { data: watchlist = [], isLoading, refetch } = useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: () => fetchWatchlist(user!.id),
    enabled: !!user,
  });

  if (!user) {
    return (
      <>
        <Helmet>
          <title>My Downloads | VineVid</title>
          <meta name="description" content="Sign in to view your download list on VineVid" />
        </Helmet>
        
        <div className="min-h-screen flex flex-col">
          <Header />
          
          <main className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
              <CardContent className="pt-6">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please sign in to view your download list and save your favorite content.
                </p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </main>
          
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Downloads | VineVid</title>
        <meta name="description" content="Your saved videos and favorite content on VineVid" />
        <link rel="canonical" href={`${window.location.origin}/watchlist`} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Downloads</h1>
              <p className="text-muted-foreground">
                {watchlist.length} video{watchlist.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Your download list is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Start adding content to your list by clicking the heart icon on any video.
                </p>
                <Button asChild>
                  <Link to="/">Browse Videos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "space-y-4"
            )}>
              {watchlist.map((item) => (
                <VideoCard
                  key={item.id}
                  video={{
                    id: item.videos.id,
                    title: item.videos.title,
                    poster_url: item.videos.poster_url,
                    year: item.videos.year,
                    category: item.videos.categories,
                    video_downloads: item.videos.video_downloads,
                  }}
                  isInWatchlist={true}
                  onWatchlistChange={refetch}
                  className={viewMode === 'list' ? "flex flex-row" : undefined}
                />
              ))}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Downloads;