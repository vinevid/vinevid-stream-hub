import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const fetchComments = async () => {
  const { data, error } = await supabase
    .from("comments")
    .select("id,name,content,status,video_id,parent_id,is_admin_reply,created_at")
    .is("parent_id", null) // Only top-level comments
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

const fetchReplies = async (parentId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
};

const AdminComments = () => {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["admin-comments"], queryFn: fetchComments });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

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

  const doReply = useMutation({
    mutationFn: async ({ parentId, content, videoId }: { parentId: string; content: string; videoId: string }) => {
      const { error } = await supabase.from("comments").insert({
        parent_id: parentId,
        video_id: videoId,
        name: "Admin",
        content: content.trim(),
        status: "approved",
        is_admin_reply: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-comments"] });
      qc.invalidateQueries({ queryKey: ["replies"] });
      setReplyingTo(null);
      setReplyText("");
    },
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
            <CommentCard 
              key={c.id} 
              comment={c} 
              onUpdate={doUpdate.mutate}
              onDelete={doDelete.mutate}
              onReply={(id) => setReplyingTo(id)}
              onSubmitReply={(parentId, content) => doReply.mutate({ parentId, content, videoId: c.video_id })}
              replyingTo={replyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              isReplying={doReply.isPending}
            />
          ))}
          {(items ?? []).length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
};

const CommentCard = ({ 
  comment, 
  onUpdate, 
  onDelete, 
  onReply, 
  onSubmitReply, 
  replyingTo, 
  replyText, 
  setReplyText, 
  isReplying 
}: any) => {
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", comment.id],
    queryFn: () => fetchReplies(comment.id),
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSubmitReply(comment.id, replyText);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {comment.name} — <span className="text-muted-foreground text-sm">{new Date(comment.created_at).toLocaleString()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm max-w-3xl">{comment.content}</p>
        
        {replies.length > 0 && (
          <div className="space-y-2 border-l-2 border-muted pl-4">
            <h4 className="text-sm font-medium text-muted-foreground">Replies:</h4>
            {replies.map((reply: any) => (
              <div key={reply.id} className="bg-muted/50 p-3 rounded">
                <div className="text-sm font-medium">
                  {reply.is_admin_reply ? (
                    <span className="text-primary font-bold">{reply.name} (Admin)</span>
                  ) : (
                    reply.name
                  )}
                  <span className="text-muted-foreground ml-2">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {replyingTo === comment.id && (
          <form onSubmit={handleReplySubmit} className="space-y-3 border border-primary/20 p-3 rounded">
            <Input
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isReplying}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isReplying || !replyText.trim()}>
                {isReplying ? "Sending..." : "Reply"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onReply(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onUpdate({ id: comment.id, status: "approved" })}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdate({ id: comment.id, status: "pending" })}>Pending</Button>
            <Button size="sm" variant="destructive" onClick={() => onUpdate({ id: comment.id, status: "spam" })}>Spam</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(comment.id)}>Delete</Button>
          </div>
          {replyingTo !== comment.id && (
            <Button size="sm" variant="default" onClick={() => onReply(comment.id)}>
              Reply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminComments;
