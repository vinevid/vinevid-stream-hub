import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    poster_url?: string;
    year?: number;
    category?: { name: string };
    video_downloads?: Array<{ label: string; sort_order: number }>;
  };
  isInWatchlist?: boolean;
  showRating?: boolean;
  averageRating?: number;
  onWatchlistChange?: () => void;
  className?: string;
}

export const VideoCard = ({
  video,
  isInWatchlist = false,
  showRating = false,
  averageRating,
  onWatchlistChange,
  className
}: VideoCardProps) => {
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const { user } = useAuth();

  const getLatestEpisode = (downloads: Array<{ label: string; sort_order: number }>) => {
    if (!downloads?.length) return null;
    return downloads.reduce((latest, current) => 
      current.sort_order > latest.sort_order ? current : latest
    );
  };

  const latestEpisode = getLatestEpisode(video.video_downloads || []);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to add to watchlist');
      return;
    }

    setIsWatchlistLoading(true);

    try {
      if (isInWatchlist) {
        const { error } = await supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', video.id);

        if (error) throw error;
        toast.success('Removed from watchlist');
      } else {
        const { error } = await supabase
          .from('user_watchlist')
          .insert({
            user_id: user.id,
            video_id: video.id
          });

        if (error) throw error;
        toast.success('Added to watchlist');
      }

      onWatchlistChange?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105",
      className
    )}>
      <Link to={`/video/${video.id}`}>
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={video.poster_url || '/placeholder.svg'}
            alt={`${video.title} poster`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">
              {video.title}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 p-1 h-8 w-8 shrink-0"
              onClick={handleWatchlistToggle}
              disabled={isWatchlistLoading}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-colors",
                  isInWatchlist 
                    ? "fill-red-500 text-red-500" 
                    : "text-muted-foreground hover:text-red-500"
                )}
              />
            </Button>
          </div>
          
          <div className="space-y-2">
            {video.category && (
              <Badge variant="secondary" className="text-xs">
                {video.category.name}
              </Badge>
            )}
            
            {video.year && (
              <p className="text-xs text-muted-foreground">
                {video.year}
              </p>
            )}
            
            {latestEpisode && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Play className="h-3 w-3" />
                <span>{latestEpisode.label}</span>
              </div>
            )}
            
            {showRating && averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};