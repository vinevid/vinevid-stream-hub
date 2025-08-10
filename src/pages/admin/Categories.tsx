import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,position,visible")
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
};

const Categories = () => {
  const qc = useQueryClient();
  const { data: cats } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories });
  const [name, setName] = useState("");

  const add = useMutation({
    mutationFn: async () => {
      const maxPos = Math.max(0, ...((cats ?? []).map(c => c.position)));
      const { error } = await supabase.from("categories").insert({ name, position: maxPos + 1, visible: true });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["admin-categories"] }); },
  });

  const setVisible = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase.from("categories").update({ visible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const move = useMutation({
    mutationFn: async ({ id, dir }: { id: string; dir: -1 | 1 }) => {
      const list = cats ?? [];
      const idx = list.findIndex((c) => c.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= list.length) return;
      const a = list[idx];
      const b = list[to];
      await supabase.from("categories").update({ position: b.position }).eq("id", a.id);
      await supabase.from("categories").update({ position: a.position }).eq("id", b.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  return (
    <>
      <Helmet>
        <title>Manage Categories | VineVid</title>
        <meta name="description" content="Admin: add, edit, reorder and toggle categories" />
        <link rel="canonical" href={`${location.origin}/admin/categories`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex gap-2">
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
          <Button onClick={() => add.mutate()} disabled={!name.trim()}>Add</Button>
        </div>
        <div className="space-y-3">
          {(cats ?? []).map((c, idx) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">pos {c.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => move.mutate({ id: c.id, dir: -1 })} disabled={idx === 0}>↑</Button>
                  <Button size="icon" variant="outline" onClick={() => move.mutate({ id: c.id, dir: 1 })} disabled={idx === (cats?.length ?? 0) - 1}>↓</Button>
                  <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={c.visible} onChange={(e) => setVisible.mutate({ id: c.id, visible: e.target.checked })} /> Visible</label>
                  <Button size="sm" variant="destructive" onClick={() => del.mutate(c.id)}>Delete</Button>
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

export default Categories;
