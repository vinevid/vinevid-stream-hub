import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { videos } from "@/data/videos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const CategoryListing = () => {
  const { category } = useParams<{ category: string }>();
  
  const categoryTitle = category === "kdrama" ? "KDrama" : category === "cdrama" ? "CDrama" : category;
  const filteredVideos = videos.filter(video => 
    video.category.toLowerCase() === categoryTitle?.toLowerCase()
  );

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
          
          {filteredVideos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVideos.map((video) => (
                <Link key={video.id} to={`/video/${video.id}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/2] overflow-hidden">
                      <img
                        src={video.image}
                        alt={`${video.title} poster`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{video.category}</span>
                        <span>{video.year}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {video.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded-sm text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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