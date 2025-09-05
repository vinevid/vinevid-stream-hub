import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface FeaturedVideo {
  id: string;
  title: string;
  description: string;
  image_url: string;
  position: number;
  video_id: string;
  videos: {
    id: string;
    title: string;
    description?: string;
    poster_url?: string;
    year?: number;
    category?: { name: string };
  };
}

const fetchFeaturedContent = async (): Promise<FeaturedVideo[]> => {
  const { data, error } = await supabase
    .from('featured_content')
    .select(`
      *,
      videos:video_id (
        id,
        title,
        description,
        poster_url,
        year,
        categories:category_id (name)
      )
    `)
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: featuredContent = [], isLoading } = useQuery({
    queryKey: ['featured-content'],
    queryFn: fetchFeaturedContent,
  });

  useEffect(() => {
    if (featuredContent.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredContent.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredContent.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
  };

  if (isLoading || !featuredContent.length) {
    return (
      <section className="relative h-[60vh] bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse">
        <div className="absolute inset-0 bg-black/20" />
      </section>
    );
  }

  const currentContent = featuredContent[currentSlide];
  const video = currentContent.videos;

  return (
    <section className="relative h-[60vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentContent.image_url || video.poster_url || '/placeholder.svg'}
          alt={currentContent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6">
            {video.category && (
              <Badge variant="secondary" className="text-sm">
                {video.category.name}
              </Badge>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {currentContent.title}
            </h1>
            
            <p className="text-lg text-gray-200 line-clamp-3 max-w-xl">
              {currentContent.description || video.description}
            </p>
            
            {video.year && (
              <p className="text-gray-300">
                Released: {video.year}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                <Link to={`/video/${video.id}`}>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {featuredContent.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredContent.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};