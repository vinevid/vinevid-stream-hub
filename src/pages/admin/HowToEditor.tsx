import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const fetchDoc = async () => {
  const { data, error } = await supabase.from("how_to_content").select("id,content").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
};

const HowToEditor = () => {
  const { data: doc, refetch } = useQuery({ queryKey: ["admin-howto"], queryFn: fetchDoc });
  const [content, setContent] = useState("");
  useEffect(() => { if (doc) setContent(doc.content ?? ""); }, [doc]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("how_to_content").update({ content }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => refetch(),
  });

  return (
    <>
      <Helmet>
        <title>Edit How To Download | VineVid</title>
        <meta name="description" content="Admin: edit the how-to-download guide" />
        <link rel="canonical" href={`${location.origin}/admin/how-to`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Edit “How to Download”</h1>
        <Card>
          <CardHeader><CardTitle>Content</CardTitle></CardHeader>
          <CardContent>
            <textarea
              className="w-full rounded-md border bg-background p-3 min-h-[300px]"
              placeholder="Write steps here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
};

export default HowToEditor;
