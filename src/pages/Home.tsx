import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeDialog } from "@/components/WelcomeDialog";

function useQueryParams() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const fetchVideos = async () => {
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

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("visible", true)
    .order("position");
  if (error) throw error;
  return data;
};

const Home = () => {
  const q = useQueryParams().get("q")?.toLowerCase() ?? "";
  const { data: videos = [] } = useQuery({ queryKey: ["videos"], queryFn: fetchVideos });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  
  // Get latest episode for each video
  const getLatestEpisode = (video: any) => {
    if (!video.video_downloads || video.video_downloads.length === 0) return null;
    const sortedEpisodes = video.video_downloads.sort((a: any, b: any) => b.sort_order - a.sort_order);
    return sortedEpisodes[0];
  };
  
  const filtered = q
    ? videos.filter((v) => v.title.toLowerCase().includes(q) || (v.tags || []).join(" ").includes(q))
    : videos;
  const trending = videos.filter((v) => v.trending).slice(0, 8);
  const topCdrama = videos.filter((v) => v.top_cdrama).slice(0, 8);
  const topKdrama = videos.filter((v) => v.top_kdrama).slice(0, 8);
  
  // Get videos by category for the category sections
  const getVideosByCategory = (categoryName: string) => {
    return videos.filter((v) => v.categories?.name === categoryName).slice(0, 8);
  };

  return (
    <>
      <Helmet>
        <title>VineVid | Premium Movie Downloads</title>
        <meta name="description" content="Download movies fast and free. Latest updates, trending, and categories at VineVid." />
        <link rel="canonical" href={`${location.origin}/home`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-10">
        <section aria-labelledby="latest" className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 id="latest" className="text-2xl font-bold tracking-tight">Latest Updates</h1>
            {filtered.length > 8 && (
              <Link to="/latest" className="text-sm text-primary hover:underline">See more</Link>
            )}
          </div>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, 8).map((v) => {
              const latestEpisode = getLatestEpisode(v);
              return (
                <Link key={v.id} to={`/video/${v.id}`} className="group">
                  <Card className="h-full overflow-hidden">
                     <div className="aspect-[3/2] overflow-hidden relative">
                       <img
                         src={v.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"}
                         alt={`${v.title} poster`}
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
                       <CardTitle className="text-base">{v.title}</CardTitle>
                     </CardHeader>
                     <CardContent className="text-sm text-muted-foreground">
                       <span>{v.categories?.name}</span> · <span>{v.year}</span>
                     </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {trending.length > 0 && (
          <section aria-labelledby="trending" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="trending" className="text-xl font-semibold">Trending</h2>
              {videos.filter((v) => v.trending).length > 8 && (
                <Link to="/trending" className="text-sm text-primary hover:underline">See more</Link>
              )}
            </div>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trending.map((v) => {
                const latestEpisode = getLatestEpisode(v);
                return (
                  <Link key={v.id} to={`/video/${v.id}`} className="group">
                    <Card className="h-full overflow-hidden border-primary/30">
                       <div className="aspect-[3/2] overflow-hidden relative">
                         <img
                           src={v.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"}
                           alt={`${v.title} poster`}
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
                        <CardTitle className="text-base">{v.title}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {topCdrama.length > 0 && (
          <section aria-labelledby="top-cdrama" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="top-cdrama" className="text-xl font-semibold">Top CDrama</h2>
              {videos.filter((v) => v.top_cdrama).length > 8 && (
                <Link to="/top-cdrama" className="text-sm text-primary hover:underline">See more</Link>
              )}
            </div>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topCdrama.map((v) => {
                const latestEpisode = getLatestEpisode(v);
                return (
                  <Link key={v.id} to={`/video/${v.id}`} className="group">
                    <Card className="h-full overflow-hidden">
                       <div className="aspect-[3/2] overflow-hidden relative">
                         <img
                           src={v.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"}
                           alt={`${v.title} poster`}
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
                         <CardTitle className="text-base">{v.title}</CardTitle>
                       </CardHeader>
                       <CardContent className="text-sm text-muted-foreground">
                         <span>{v.categories?.name}</span> · <span>{v.year}</span>
                       </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {topKdrama.length > 0 && (
          <section aria-labelledby="top-kdrama" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="top-kdrama" className="text-xl font-semibold">Top KDrama</h2>
              {videos.filter((v) => v.top_kdrama).length > 8 && (
                <Link to="/top-kdrama" className="text-sm text-primary hover:underline">See more</Link>
              )}
            </div>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topKdrama.map((v) => {
                const latestEpisode = getLatestEpisode(v);
                return (
                  <Link key={v.id} to={`/video/${v.id}`} className="group">
                    <Card className="h-full overflow-hidden">
                       <div className="aspect-[3/2] overflow-hidden relative">
                         <img
                           src={v.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"}
                           alt={`${v.title} poster`}
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
                         <CardTitle className="text-base">{v.title}</CardTitle>
                       </CardHeader>
                       <CardContent className="text-sm text-muted-foreground">
                         <span>{v.categories?.name}</span> · <span>{v.year}</span>
                       </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Category sections */}
        {categories.map((category) => {
          const categoryVideos = getVideosByCategory(category.name);
          const allCategoryVideos = videos.filter((v) => v.categories?.name === category.name);
          
          if (categoryVideos.length === 0) return null;
          
          return (
            <section key={category.id} aria-labelledby={`category-${category.name.toLowerCase()}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 id={`category-${category.name.toLowerCase()}`} className="text-xl font-semibold">{category.name}</h2>
                {allCategoryVideos.length > 8 && (
                  <Link to={`/category/${category.name.toLowerCase()}`} className="text-sm text-primary hover:underline">See more</Link>
                )}
              </div>
               <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {categoryVideos.map((v) => {
                  const latestEpisode = getLatestEpisode(v);
                  return (
                    <Link key={v.id} to={`/video/${v.id}`} className="group">
                      <Card className="h-full overflow-hidden">
                         <div className="aspect-[3/2] overflow-hidden relative">
                           <img
                             src={v.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=1200&auto=format&fit=crop"}
                             alt={`${v.title} poster`}
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
                           <CardTitle className="text-base">{v.title}</CardTitle>
                         </CardHeader>
                         <CardContent className="text-sm text-muted-foreground">
                           <span>{v.categories?.name}</span> · <span>{v.year}</span>
                         </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section aria-labelledby="all-categories" className="space-y-4">
          <h2 id="all-categories" className="text-xl font-semibold">Browse All Categories</h2>
           <div className="flex flex-wrap gap-2">
             {categories.map((c) => (
               <Link key={c.id} to={`/category/${c.name.toLowerCase()}`} className="px-3 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary/10">
                 {c.name}
               </Link>
             ))}
           </div>
        </section>
      </main>
      <Footer />
      <WelcomeDialog />
    </>
  );
};

export default Home;
