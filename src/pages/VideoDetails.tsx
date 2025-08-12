import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Comments } from "@/sections/Comments";

const fetchVideo = async (id: string) => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name),
      video_downloads(id, label, url, subtitle_url, sort_order)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
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
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: () => fetchVideo(id!),
    enabled: !!id,
  });

  const { data: relatedVideos = [] } = useQuery({
    queryKey: ["related-videos", video?.category_id, id],
    queryFn: () => fetchRelatedVideos(video!.category_id, id!),
    enabled: !!video?.category_id && !!id,
  });

  const onDownload = (downloadUrl: string) => {
    // Use fake download page with the actual URL as target
    const fakeDownloadUrl = `/download/${id}?target=${encodeURIComponent(downloadUrl)}`;
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

  if (isLoading) return <div>Loading...</div>;
  if (!video) return <div>Video not found</div>;

  return (
    <>
      <Helmet>
        <title>{video.title} | VineVid</title>
        <meta name="description" content={video.description || `Watch ${video.title} - ${video.categories?.name} ${video.year}`} />
        <link rel="canonical" href={`${location.origin}/video/${video.id}`} />
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
                    {download.subtitle_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => onSubtitleDownload(download.subtitle_url)}
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