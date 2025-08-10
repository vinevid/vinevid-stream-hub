import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { videos, categories } from "@/data/videos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const Home = () => {
  const q = useQuery().get("q")?.toLowerCase() ?? "";
  const latest = [...videos].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const filtered = q
    ? latest.filter((v) => v.title.toLowerCase().includes(q) || v.tags.join(" ").includes(q))
    : latest;
  const trending = latest.filter((v) => v.trending);

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
          <h1 id="latest" className="text-2xl font-bold tracking-tight">Latest Updates</h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((v) => (
              <Link key={v.id} to={`/video/${v.id}`} className="group">
                <Card className="h-full overflow-hidden">
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={v.image}
                      alt={`${v.title} poster`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <span>{v.category}</span> · <span>{v.year}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {trending.length > 0 && (
          <section aria-labelledby="trending" className="space-y-4">
            <h2 id="trending" className="text-xl font-semibold">Trending</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trending.map((v) => (
                <Link key={v.id} to={`/video/${v.id}`} className="group">
                  <Card className="h-full overflow-hidden border-primary/30">
                    <div className="aspect-[3/2] overflow-hidden">
                      <img
                        src={v.image}
                        alt={`${v.title} poster`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base">{v.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="categories" className="space-y-4">
          <h2 id="categories" className="text-xl font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c} to={`/home?q=${encodeURIComponent(c)}`} className="px-3 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary/10">
                {c}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;
