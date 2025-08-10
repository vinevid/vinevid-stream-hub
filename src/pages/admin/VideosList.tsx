import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useState } from "react";

const fetchVideos = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select("id,title,year,genre,created_at,category_id,trending");
  if (error) throw error;
  return data;
};

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
};

const VideosList = () => {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "">("");
  const { data: vids } = useQuery({ queryKey: ["admin-videos"], queryFn: fetchVideos });
  const { data: cats } = useQuery({ queryKey: ["admin-cats"], queryFn: fetchCategories });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error: delLinks } = await supabase.from("video_downloads").delete().eq("video_id", id);
      if (delLinks) throw delLinks;
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
    },
  });

  const filtered = (vids ?? []).filter((v) => {
    const okQ = !q || v.title.toLowerCase().includes(q.toLowerCase());
    const okC = !cat || v.category_id === cat;
    return okQ && okC;
  });

  return (
    <>
      <Helmet>
        <title>Manage Videos | VineVid</title>
        <meta name="description" content="Admin: list, search, edit and delete videos" />
        <link rel="canonical" href={`${location.origin}/admin/videos`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Videos</h1>
          <Button asChild><Link to="/admin/videos/new">Add New Video</Link></Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Input placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <select className="rounded-md border bg-background px-3 py-2" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filtered ?? []).map((v) => (
            <Card key={v.id}>
              <CardHeader>
                <CardTitle className="text-base">{v.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <span>{v.year ?? "—"} · {v.genre ?? ""} {v.trending ? "· Trending" : ""}</span>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm"><Link to={`/admin/videos/${v.id}/edit`}>Edit</Link></Button>
                  <Button variant="destructive" size="sm" onClick={() => del.mutate(v.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VideosList;
