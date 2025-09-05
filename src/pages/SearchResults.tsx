import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VideoCard } from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SearchVideo {
  id: string;
  title: string;
  poster_url?: string;
  year?: number;
  categories: { name: string };
  video_downloads: Array<{ label: string; sort_order: number }>;
}

interface SearchFilters {
  category?: string;
  year?: string;
  sortBy: 'title' | 'year' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [watchlistVideoIds, setWatchlistVideoIds] = useState<Set<string>>(new Set());
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const year = searchParams.get('year') || '';
  const sortBy = (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'title';
  const sortOrder = (searchParams.get('sortOrder') as SearchFilters['sortOrder']) || 'asc';

  const { user } = useAuth();

  const fetchSearchResults = async () => {
    let queryBuilder = supabase
      .from('videos')
      .select(`
        id,
        title,
        poster_url,
        year,
        categories:category_id (name),
        video_downloads (label, sort_order)
      `);

    // Apply search filter
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%`);
    }

    // Apply category filter
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (categoryData) {
        queryBuilder = queryBuilder.eq('category_id', categoryData.id);
      }
    }

    // Apply year filter
    if (year) {
      queryBuilder = queryBuilder.eq('year', parseInt(year));
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await queryBuilder;
    if (error) throw error;
    return data || [];
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('visible', true)
      .order('position');
    
    if (error) throw error;
    return data || [];
  };

  const fetchUserWatchlist = async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('user_watchlist')
      .select('video_id')
      .eq('user_id', user.id);
      
    if (error) throw error;
    return data?.map(item => item.video_id) || [];
  };

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', query, category, year, sortBy, sortOrder],
    queryFn: fetchSearchResults,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: watchlistIds = [] } = useQuery({
    queryKey: ['user-watchlist', user?.id],
    queryFn: fetchUserWatchlist,
    enabled: !!user,
  });

  useEffect(() => {
    setWatchlistVideoIds(new Set(watchlistIds));
  }, [watchlistIds]);

  const updateFilter = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (query) newSearchParams.set('q', query);
    setSearchParams(newSearchParams);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const hasActiveFilters = category || year || sortBy !== 'title' || sortOrder !== 'asc';

  return (
    <>
      <Helmet>
        <title>{query ? `Search results for "${query}"` : 'Search'} | VineVid</title>
        <meta name="description" content={`Search results for videos on VineVid${query ? ` matching "${query}"` : ''}`} />
        <link rel="canonical" href={`${window.location.origin}/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {query ? `Search results for "${query}"` : 'Search Videos'}
              </h1>
              <p className="text-muted-foreground">
                {searchResults.length} video{searchResults.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
              
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

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Search Filters
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={category} onValueChange={(value) => updateFilter('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Select value={year} onValueChange={(value) => updateFilter('year', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any year</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by</label>
                    <Select value={sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="updated_at">Recently Updated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Order</label>
                    <Select value={sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No results found</h2>
                <p className="text-muted-foreground mb-6">
                  {query 
                    ? `No videos found matching "${query}". Try different keywords or adjust your filters.`
                    : 'Try searching for a video title or adjusting your filters.'
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>Clear Filters</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "space-y-4"
            )}>
              {searchResults.map((video) => (
                <VideoCard
                  key={video.id}
                  video={{
                    id: video.id,
                    title: video.title,
                    poster_url: video.poster_url,
                    year: video.year,
                    category: video.categories,
                    video_downloads: video.video_downloads,
                  }}
                  isInWatchlist={watchlistVideoIds.has(video.id)}
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

export default SearchResults;