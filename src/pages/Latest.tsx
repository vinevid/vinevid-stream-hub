import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const fetchLatestVideos = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name),
      video_downloads(label, sort_order)
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const Latest = () => {
  const { data: videos = [] } = useQuery({
    queryKey: ["latest-videos"],
    queryFn: fetchLatestVideos,
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
        <title>Latest Updates | VineVid</title>
        <meta name="description" content="Latest movie and series updates on VineVid. Newest releases and episodes." />
        <link rel="canonical" href={`${location.origin}/latest`} />
      </Helmet>
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Latest Updates</h1>
            <p className="text-muted-foreground">
              Discover the newest movies and series on VineVid
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
              <p className="text-muted-foreground">No videos found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Latest;