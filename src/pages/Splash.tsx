import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Splash = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>VineVid | Fast. Free. Forever.</title>
        <meta name="description" content="VineVid – premium fast movie downloads" />
        <link rel="canonical" href={`${location.origin}/`} />
      </Helmet>
      <div className="min-h-screen grid place-items-center bg-[radial-gradient(1200px_circle_at_50%_-20%,hsl(var(--brand-surface-glow))_0%,transparent_60%)]">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">VineVid</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">Fast. Free. Forever. VineVid.</p>
        </div>
      </div>
    </>
  );
};

export default Splash;
