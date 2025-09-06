import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Download, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Autoplay from "embla-carousel-autoplay";

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
    categories: { name: string };
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

export const HeroCarousel = () => {
  const { data: featuredContent = [], isLoading } = useQuery({
    queryKey: ['featured-content'],
    queryFn: fetchFeaturedContent,
  });

  if (isLoading || !featuredContent.length) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse">
        <div className="absolute inset-0 bg-black/20" />
      </section>
    );
  }

  return (
    <section className="relative">
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent>
          {featuredContent.map((content) => (
            <CarouselItem key={content.id}>
              <div className="relative h-[70vh] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={content.image_url || content.videos.poster_url || '/placeholder.svg'}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl space-y-6">
                      {content.videos.categories && (
                        <Badge variant="secondary" className="text-sm">
                          {content.videos.categories.name}
                        </Badge>
                      )}
                      
                      <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                        {content.title}
                      </h1>
                      
                      <p className="text-lg text-gray-200 line-clamp-3 max-w-xl">
                        {content.description || content.videos.description}
                      </p>
                      
                      {content.videos.year && (
                        <p className="text-gray-300">
                          Released: {content.videos.year}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4">
                        <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                          <Link to={`/video/${content.videos.id}`}>
                            <Download className="mr-2 h-5 w-5" />
                            Download Now
                          </Link>
                        </Button>
                        
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                          <Link to={`/video/${content.videos.id}`}>
                            <Info className="mr-2 h-5 w-5" />
                            More Info
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </section>
  );
};