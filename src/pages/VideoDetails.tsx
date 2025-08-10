import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { videos } from "@/data/videos";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Comments } from "@/sections/Comments";

const VideoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const v = videos.find((x) => x.id === id);
  if (!v) return null;

  const onDownload = () => {
    navigate(`/download/${v.id}?target=${encodeURIComponent(v.shortLink)}`);
  };

  const related = videos.filter((x) => x.category === v.category && x.id !== v.id).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>{`${v.title} | VineVid`}</title>
        <meta name="description" content={v.description} />
        <link rel="canonical" href={`${location.origin}/video/${v.id}`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1fr,2fr] items-start">
          <img src={v.image} alt={`${v.title} poster`} className="w-full max-w-sm rounded-lg border" loading="lazy" />
          <div>
            <h1 className="text-2xl font-bold">{v.title}</h1>
            <p className="text-muted-foreground mt-2">{v.description}</p>
            <div className="mt-4 text-sm text-muted-foreground">{v.category} · {v.year} · {v.tags.join(", ")}</div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Episode List</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 16 }, (_, i) => (
              <Button 
                key={i + 1} 
                variant="default" 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => window.open(`https://exe.io/episode-${i + 1}`, '_blank')}
              >
                <span className="font-medium">Episode {i + 1}</span>
                <span className="text-xs opacity-90">Click to Download</span>
              </Button>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">More Like This</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link to={`/video/${r.id}`} key={r.id} className="group">
                  <div className="rounded-lg overflow-hidden border">
                    <img src={r.image} alt={`${r.title} poster`} className="h-40 w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="mt-2 text-sm">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <Comments videoId={v.id} />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default VideoDetails;
