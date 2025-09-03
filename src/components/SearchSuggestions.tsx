import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface SearchSuggestionsProps {
  query: string;
  onSelect: () => void;
}

const fetchSearchSuggestions = async (query: string) => {
  if (!query.trim()) return [];
  
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, poster_url, categories(name)")
    .ilike("title", `%${query}%`)
    .limit(5);
    
  if (error) throw error;
  return data || [];
};

export const SearchSuggestions = ({ query, onSelect }: SearchSuggestionsProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: suggestions = [] } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: () => fetchSearchSuggestions(query),
    enabled: query.trim().length > 1,
  });

  useEffect(() => {
    setShowSuggestions(query.trim().length > 1 && suggestions.length > 0);
  }, [query, suggestions.length]);

  if (!showSuggestions) return null;

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 border bg-popover shadow-lg">
      <div className="max-h-60 overflow-y-auto p-2">
        {suggestions.map((video) => (
          <Link
            key={video.id}
            to={`/video/${video.id}`}
            onClick={onSelect}
            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
          >
            <img
              src={video.poster_url || "https://images.unsplash.com/photo-1534237710431-e2fc698436d0?q=80&w=100&auto=format&fit=crop"}
              alt={video.title}
              className="w-12 h-8 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{video.title}</div>
              <div className="text-xs text-muted-foreground">{video.categories?.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};