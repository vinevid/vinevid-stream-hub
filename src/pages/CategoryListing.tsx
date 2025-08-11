import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const fetchVideosByCategory = async (categoryName: string) => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories!inner(name),
      video_downloads(label, sort_order)
    `)
    .ilike("categories.name", categoryName)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const CategoryListing = () => {
  const { category } = useParams<{ category: string }>();
  const { data: filtered = [] } = useQuery({
    queryKey: ["category-videos", category],
    queryFn: () => fetchVideosByCategory(category!),
    enabled: !!category,
  });

  // Get latest episode for each video
  const getLatestEpisode = (video: any) => {
    if (!video.video_downloads || video.video_downloads.length === 0) return null;
    const sortedEpisodes = video.video_downloads.sort((a: any, b: any) => b.sort_order - a.sort_order);
    return sortedEpisodes[0];
  };

  const categoryTitle = category === "kdrama" ? "KDrama" : category === "cdrama" ? "CDrama" : category;

  return (
    <>
      <Helmet>
        <title>{categoryTitle} Series | VineVid</title>
        <meta name="description" content={`Watch and download all ${categoryTitle} series on VineVid. Latest episodes and seasons available.`} />
        <link rel="canonical" href={`${location.origin}/category/${category}`} />
      </Helmet>
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">All {categoryTitle}</h1>
            <p className="text-muted-foreground">
              Discover all {categoryTitle} series available on VineVid
            </p>
          </div>
          
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((video) => {
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
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(video.tags || []).map((tag) => (
                            <span key={tag} className="px-1 py-0.5 bg-muted rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No {categoryTitle} series found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CategoryListing;