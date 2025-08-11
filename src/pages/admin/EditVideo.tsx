import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import DownloadsEditor, { EpisodeItem } from "@/components/admin/DownloadsEditor";

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
};

const EditVideo = () => {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: cats } = useQuery({ queryKey: ["admin-cats"], queryFn: fetchCategories });
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string | "">("");
  const [downloads, setDownloads] = useState<EpisodeItem[]>([]);
  const [trending, setTrending] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [topCdrama, setTopCdrama] = useState(false);
  const [topKdrama, setTopKdrama] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from("videos").select("* ").eq("id", id).maybeSingle();
      if (data) {
        setTitle(data.title ?? "");
        setPoster(data.poster_url ?? null);
        setDescription(data.description ?? "");
        setGenre(data.genre ?? "");
        setTags((data.tags ?? []).join(", "));
        setYear(data.year ?? "");
        setCategoryId(data.category_id ?? "");
        setTrending(data.trending ?? false);
        setCommentsEnabled(data.comments_enabled ?? true);
        setTopCdrama(data.top_cdrama ?? false);
        setTopKdrama(data.top_kdrama ?? false);
      }
      const { data: dls } = await supabase
        .from("video_downloads")
        .select("id,label,url,sort_order")
        .eq("video_id", id)
        .order("sort_order", { ascending: true });
      setDownloads((dls ?? []).map((d) => ({ ...d })));
    };
    init();
  }, [id]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("videos").update({
        title,
        poster_url: poster,
        description,
        genre: genre || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        year: year === "" ? null : Number(year),
        category_id: categoryId as string,
        trending,
        comments_enabled: commentsEnabled,
        top_cdrama: topCdrama,
        top_kdrama: topKdrama,
      }).eq("id", id);
      if (error) throw error;
      // Upsert downloads: simplest approach - delete then insert current list
      const { error: del } = await supabase.from("video_downloads").delete().eq("video_id", id);
      if (del) throw del;
      if (downloads.length > 0) {
        const payload = downloads.map((d, i) => ({
          video_id: id as string,
          label: d.label,
          url: d.url,
          sort_order: i,
        }));
        const { error: ins } = await supabase.from("video_downloads").insert(payload);
        if (ins) throw ins;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
      navigate("/admin/videos");
    },
  });

  return (
    <>
      <Helmet>
        <title>Edit Video | VineVid</title>
        <meta name="description" content="Admin: edit video metadata and episodes" />
        <link rel="canonical" href={`${location.origin}/admin/videos/${id}/edit`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Video</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Genre (or leave blank)" value={genre} onChange={(e) => setGenre(e.target.value)} />
                <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                <Input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="text-sm">Category</label>
                  <select className="mt-1 w-full rounded-md border bg-background px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Select...</option>
                    {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} /> Trending</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={commentsEnabled} onChange={(e) => setCommentsEnabled(e.target.checked)} /> Comments Enabled</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={topCdrama} onChange={(e) => setTopCdrama(e.target.checked)} /> Top CDrama</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={topKdrama} onChange={(e) => setTopKdrama(e.target.checked)} /> Top KDrama</label>
              </div>
              <DownloadsEditor items={downloads} onChange={setDownloads} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Poster</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {poster && <img src={poster} alt="Poster preview" className="rounded-md border" />}
              <ImageUploader bucket="posters" onUploaded={(url) => setPoster(url)} />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending || !title || !categoryId}>Save Changes</Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EditVideo;
