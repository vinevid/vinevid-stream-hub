import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";

const SimplePage = ({ title, body, path }: { title: string; body: string; path: string }) => (
  <>
    <Helmet>
      <title>{`${title} | VineVid`}</title>
      <meta name="description" content={body} />
      <link rel="canonical" href={`${location.origin}/${path}`} />
    </Helmet>
    <Header />
    <main className="container py-10">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground max-w-3xl">{body}</p>
    </main>
    <Footer />
  </>
);

export const About = () => (
  <SimplePage title="About" path="about" body="VineVid is a fast, clean movie download hub focused on speed and simplicity." />
);
export const DMCA = () => (
  <SimplePage title="DMCA" path="dmca" body="If you own rights to any content and want it removed, contact us and we will respond promptly." />
);
export const Contact = () => (
  <SimplePage title="Contact" path="contact" body="For inquiries and takedowns, reach us via contact@vinevid.app." />
);
