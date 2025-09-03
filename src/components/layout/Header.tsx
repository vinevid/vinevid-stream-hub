import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/Logo";
import { Search } from "lucide-react";
import { useState } from "react";
import { SearchSuggestions } from "@/components/SearchSuggestions";
import { ScrollingBanner } from "@/components/ScrollingBanner";

export const Header = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/home?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = () => {
    setShowSuggestions(false);
    setQuery("");
  };

  return (
    <>
      <ScrollingBanner />
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/home" className="flex items-center gap-3" aria-label="VineVid Home">
          <div className="h-8 w-8"><Logo /></div>
          <span className="text-lg font-bold tracking-tight text-primary">VineVid</span>
        </Link>
        <form onSubmit={onSearch} className="hidden md:flex items-center gap-2 max-w-lg w-full">
          <div className="relative w-full">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search movies, dramas..."
              aria-label="Search"
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {showSuggestions && (
              <SearchSuggestions query={query} onSelect={handleSuggestionSelect} />
            )}
          </div>
          <Button type="submit" variant="default">Search</Button>
        </form>
        <nav className="flex items-center gap-2">
          <Link to="/how-to-download" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground">How to Download</Link>
          <ThemeToggle />
        </nav>
      </div>
      {/* Mobile search */}
      <form onSubmit={onSearch} className="md:hidden p-3">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search movies, dramas..."
            aria-label="Search"
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {showSuggestions && (
            <SearchSuggestions query={query} onSelect={handleSuggestionSelect} />
          )}
        </div>
      </form>
    </header>
    </>
  );
};
