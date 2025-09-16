import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Comments } from "@/sections/Comments";
import { Skeleton } from "@/components/ui/skeleton";

const fetchVideoById = async (id: string) => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name),
      video_downloads(*)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

const fetchVideoByTitle = async (title: string) => {
  // Convert URL-friendly title to searchable format
  const searchTitle = title.replace(/-/g, ' ');
  
  console.log("Searching for title:", searchTitle);
  
  // Get all videos and filter locally for better matching
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name),
      video_downloads(*)
    `);
    
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No videos found in database");
  }
  
  // Try to find the best match
  // First try exact match (case insensitive)
  const exactMatch = data.find(v => 
    v.title.toLowerCase() === searchTitle.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Then try to find by contains
  const partialMatches = data.filter(v => 
    v.title.toLowerCase().includes(searchTitle.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    // Sort by closest length match
    partialMatches.sort((a, b) => 
      Math.abs(a.title.length - searchTitle.length) - 
      Math.abs(b.title.length - searchTitle.length)
    );
    return partialMatches[0];
  }
  
  // If still no match, try more flexible matching
  const words = searchTitle.toLowerCase().split(' ').filter(w => w.length > 3);
  if (words.length > 0) {
    for (const video of data) {
      for (const word of words) {
        if (video.title.toLowerCase().includes(word)) {
          return video;
        }
      }
    }
  }
  
  throw new Error("Video not found");
};

const fetchRelatedVideos = async (categoryId: string, videoId: string) => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name)
    `)
    .eq("category_id", categoryId)
    .neq("id", videoId)
    .limit(4);
  if (error) throw error;
  return data;
};

const VideoDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // Extract id or title from params
  const id = params.id;
  const title = params.title;
  
  const { data: video, isLoading, error } = useQuery({
    queryKey: ["video", id, title],
    queryFn: async () => {
      if (id) {
        return fetchVideoById(id);
      } else if (title) {
        return fetchVideoByTitle(title);
      }
      throw new Error("No id or title provided");
    },
    enabled: !!(id || title),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: relatedVideos = [] } = useQuery({
    queryKey: ["related-videos", video?.category_id, video?.id],
    queryFn: () => fetchRelatedVideos(video!.category_id, video!.id),
    enabled: !!video?.category_id && !!video?.id,
  });

  const onDownload = (downloadUrl: string) => {
    // Use fake download page with the actual URL as target
    const videoId = video?.id || id;
    const fakeDownloadUrl = `/download/${videoId}?target=${encodeURIComponent(downloadUrl)}`;
    window.open(fakeDownloadUrl, '_blank');
  };

  const onSubtitleDownload = (subtitleUrl: string) => {
    // Direct download for subtitle files
    const link = document.createElement('a');
    link.href = subtitleUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  if (!video) return <div>Video not found</div>;

  return (
    <>
      <Helmet>
        <title>{video.title} | VineVid</title>
        <meta name="description" content={video.description || `Watch ${video.title} - ${video.categories?.name} ${video.year}`} />
        <link rel="canonical" href={`${location.origin}/${video.title.toLowerCase().replace(/\s+/g, '-')}`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1fr,2fr] items-start">
          <img 
            src={video.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"} 
            alt={`${video.title} poster`} 
            className="w-full max-w-sm rounded-lg border" 
            loading="lazy" 
          />
          <div>
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <p className="text-muted-foreground mt-2">{video.description}</p>
            <div className="mt-4 text-sm text-muted-foreground">
              {video.categories?.name} · {video.year} · {(video.tags || []).join(", ")}
            </div>
          </div>
        </section>

        {video.video_downloads && video.video_downloads.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Episode List</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {video.video_downloads
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((download) => (
                  <div key={download.id} className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => onDownload(download.url)}
                    >
                      <span className="font-medium">{download.label}</span>
                      <span className="text-xs opacity-90">Click to Download</span>
                    </Button>
                    {(download as any).subtitle_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => onSubtitleDownload((download as any).subtitle_url)}
                      >
                        <span className="text-xs">Download Subtitles</span>
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {relatedVideos.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">More Like This</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedVideos.map((r) => (
                <Link to={`/video/${r.id}`} key={r.id} className="group">
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={r.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"} 
                      alt={`${r.title} poster`} 
                      className="h-40 w-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <p className="mt-2 text-sm">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {video.comments_enabled && (
          <section className="mt-10">
            <Comments videoId={video.id} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default VideoDetails;