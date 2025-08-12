import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet-async";

const DELAY = 7000; // 7 seconds

const FakeDownload = () => {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const target = sp.get("target") || "https://example.com";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const i = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, Math.round((elapsed / DELAY) * 100)));
    }, 100);
    const t = setTimeout(() => {
      window.location.href = target;
    }, DELAY);
    return () => {
      clearInterval(i);
      clearTimeout(t);
    };
  }, [target]);

  return (
    <>
      <Helmet>
        <title>Generating secure link... | VineVid</title>
        <meta name="description" content="Please wait while we prepare your secure download link." />
        <link rel="canonical" href={`${location.origin}/download/${id}`} />
      </Helmet>
      <Header />
      <main className="container py-16 text-center min-h-screen flex flex-col justify-center">
        <div>
          <h1 className="text-2xl font-bold">Generating secure link...</h1>
          <p className="text-muted-foreground mt-2">Please wait a few seconds</p>
          <div className="max-w-md mx-auto mt-8">
            <Progress value={progress} />
            <p className="mt-2 text-sm text-muted-foreground">Redirecting when complete</p>
          </div>
          <a href={target} className="inline-block mt-6 underline text-primary">Having trouble? Open mirror link</a>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FakeDownload;
