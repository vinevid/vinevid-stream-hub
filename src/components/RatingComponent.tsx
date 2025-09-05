import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RatingComponentProps {
  videoId: string;
  className?: string;
}

interface Rating {
  id: string;
  rating: number;
  review: string;
  created_at: string;
  user_id: string;
  user_profiles: {
    display_name: string;
  };
}

export const RatingComponent = ({ videoId, className }: RatingComponentProps) => {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasUserRated, setHasUserRated] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchRatings();
    if (user) {
      fetchUserRating();
    }
  }, [videoId, user]);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('video_ratings')
        .select(`
          id,
          rating,
          review,
          created_at,
          user_id
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        // Merge profiles with ratings
        const ratingsWithProfiles = data.map(rating => ({
          ...rating,
          user_profiles: profiles?.find(p => p.user_id === rating.user_id) || { display_name: 'Anonymous' }
        }));

        setRatings(ratingsWithProfiles);
      } else {
        setRatings([]);
      }

      if (error) throw error;

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
        setTotalRatings(data.length);
      }
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
    }
  };

  const fetchUserRating = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_ratings')
        .select('rating, review')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserRating(data.rating);
        setUserReview(data.review || '');
        setHasUserRated(true);
      }
    } catch (error) {
      // User hasn't rated yet
      setHasUserRated(false);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast.error('Please sign in to rate this video');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        user_id: user.id,
        video_id: videoId,
        rating: userRating,
        review: userReview.trim() || null,
      };

      const { error } = hasUserRated
        ? await supabase
            .from('video_ratings')
            .update(ratingData)
            .eq('user_id', user.id)
            .eq('video_id', videoId)
        : await supabase
            .from('video_ratings')
            .insert(ratingData);

      if (error) throw error;

      toast.success(hasUserRated ? 'Rating updated!' : 'Rating submitted!');
      setHasUserRated(true);
      fetchRatings();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5 transition-colors",
              interactive && "cursor-pointer",
              star <= (interactive ? (hoverRating || rating) : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
            onClick={interactive ? () => setUserRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Average Rating Display */}
      {totalRatings > 0 && (
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            {renderStars(Math.round(averageRating))}
            <p className="text-sm text-muted-foreground mt-1">
              Based on {totalRatings} review{totalRatings !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* User Rating Section */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {hasUserRated ? 'Update Your Rating' : 'Rate This Video'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Your Rating</p>
              {renderStars(userRating, true)}
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Review (Optional)</p>
              <Textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share your thoughts about this video..."
                className="min-h-[100px]"
              />
            </div>
            
            <Button onClick={submitRating} disabled={loading}>
              {loading ? 'Submitting...' : (hasUserRated ? 'Update Rating' : 'Submit Rating')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reviews</h3>
          {ratings.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{rating.user_profiles?.display_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {renderStars(rating.rating)}
                </div>
                {rating.review && (
                  <p className="text-sm mt-2">{rating.review}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};