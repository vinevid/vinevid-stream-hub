import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Download, Timer, ScanLine } from "lucide-react";

const steps = [
  { icon: Download, title: "Click your episode", desc: "Open the movie or episode page you want." },
  { icon: Timer, title: "Wait for secure link", desc: "We prepare a safe, fast download URL." },
  { icon: ScanLine, title: "Wait for the countdown", desc: "Short wait to keep content free for everyone." },
  { icon: CheckCircle2, title: "Wait for the redirection to the download page then click the download button at the top left of the page.", desc: "Your file downloads automatically." },
];

const HowToDownload = () => {
  return (
    <>
      <Helmet>
        <title>How to Download | VineVid</title>
        <meta name="description" content="Step-by-step guide to download movies safely on VineVid." />
        <link rel="canonical" href={`${location.origin}/how-to-download`} />
      </Helmet>
      <Header />
      <main className="container py-10">
        <h1 className="text-2xl font-bold mb-6">How to Download</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="rounded-lg border p-6 bg-card">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HowToDownload;
