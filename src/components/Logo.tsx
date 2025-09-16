import { useEffect, useState } from "react";
import { getTransparentLogo } from "@/utils/logoBgRemoval";

const SOURCE_URL = "/logo.png";

export const Logo = ({ className = "", alt = "VineVid logo" }: { className?: string; alt?: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getTransparentLogo(SOURCE_URL)
      .then((dataUrl) => mounted && setSrc(dataUrl))
      .catch(() => {
        // fallback to original if removal fails
        if (mounted) setSrc(SOURCE_URL);
        setError("bg-removal-failed");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} aria-label="VineVid logo">
      <div className="absolute -inset-3 rounded-xl bg-[linear-gradient(135deg,hsl(var(--brand-glow-start)),hsl(var(--brand-glow-end)))] opacity-40 blur-xl pointer-events-none will-change-transform" />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        src={src ?? SOURCE_URL}
        alt={alt}
        className="relative z-10 h-auto w-full select-none"
        loading="eager"
        decoding="async"
      />
      {error && <span className="sr-only">Background removal failed</span>}
    </div>
  );
};
