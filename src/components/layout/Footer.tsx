import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t mt-12">
      <div className="container py-8 grid gap-4 md:grid-cols-3 items-center">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} VineVid. All rights reserved.</p>
        <nav className="flex justify-center gap-6 text-sm">
          <Link to="/about" className="hover:text-primary">About</Link>
          <Link to="/dmca" className="hover:text-primary">DMCA</Link>
          <Link to="/how-to-download" className="hover:text-primary">How to Download</Link>
          <Link to="/contact" className="hover:text-primary">Contact</Link>
        </nav>
        <div className="text-right text-sm text-muted-foreground">Fast. Free. Forever.</div>
      </div>
    </footer>
  );
};
