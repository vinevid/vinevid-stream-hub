import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const fetchTopKdramaVideos = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name),
      video_downloads(label, sort_order)
    `)
    .eq("top_kdrama", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const TopKdrama = () => {
  const { data: videos = [] } = useQuery({
    queryKey: ["top-kdrama-videos"],
    queryFn: fetchTopKdramaVideos,
  });

  // Get latest episode for each video
  const getLatestEpisode = (video: any) => {
    if (!video.video_downloads || video.video_downloads.length === 0) return null;
    const sortedEpisodes = video.video_downloads.sort((a: any, b: any) => b.sort_order - a.sort_order);
    return sortedEpisodes[0];
  };

  return (
    <>
      <Helmet>
        <title>Top KDrama | VineVid</title>
        <meta name="description" content="Top Korean drama series on VineVid. Best KDrama content." />
        <link rel="canonical" href={`${location.origin}/top-kdrama`} />
      </Helmet>
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Top KDrama</h1>
            <p className="text-muted-foreground">
              Best Korean drama series on VineVid
            </p>
          </div>
          
          {videos.length > 0 ? (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => {
                const latestEpisode = getLatestEpisode(video);
                return (
                  <Link key={video.id} to={`/video/${video.id}`} className="group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[3/2] overflow-hidden relative">
                        <img
                          src={video.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"}
                          alt={`${video.title} poster`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {latestEpisode && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                            {latestEpisode.label}
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <span>{video.categories?.name}</span> · <span>{video.year}</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No top KDrama series found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TopKdrama;