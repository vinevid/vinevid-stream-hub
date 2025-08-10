import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchComments = async () => {
  const { data, error } = await supabase
    .from("comments")
    .select("id,name,content,status,video_id,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const AdminComments = () => {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["admin-comments"], queryFn: fetchComments });

  const doUpdate = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "pending" | "spam" }) => {
      const { error } = await supabase.from("comments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  });
  const doDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  });

  return (
    <>
      <Helmet>
        <title>Manage Comments | VineVid</title>
        <meta name="description" content="Admin: moderate comments across videos" />
        <link rel="canonical" href={`${location.origin}/admin/comments`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Comments</h1>
        <div className="space-y-3">
          {(items ?? []).map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.name} — <span className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleString()}</span></CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm max-w-3xl">{c.content}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => doUpdate.mutate({ id: c.id, status: "approved" })}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => doUpdate.mutate({ id: c.id, status: "pending" })}>Pending</Button>
                  <Button size="sm" variant="destructive" onClick={() => doUpdate.mutate({ id: c.id, status: "spam" })}>Spam</Button>
                  <Button size="sm" variant="destructive" onClick={() => doDelete.mutate(c.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(items ?? []).length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminComments;
