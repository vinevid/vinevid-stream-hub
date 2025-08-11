import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchComments = async (videoId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("video_id", videoId)
    .eq("status", "approved")
    .is("parent_id", null) // Only get top-level comments
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const fetchReplies = async (parentId: string) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("parent_id", parentId)
    .eq("status", "approved")
    .order("created_at", { ascending: true }); // Replies in chronological order
  
  if (error) throw error;
  return data || [];
};

export const Comments = ({ videoId }: { videoId: string }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", videoId],
    queryFn: () => fetchComments(videoId),
  });

  const addComment = useMutation({
    mutationFn: async ({ name, content }: { name: string; content: string }) => {
      const { error } = await supabase
        .from("comments")
        .insert({
          video_id: videoId,
          name: name.trim(),
          content: content.trim(),
          status: "approved", // Auto-approve all comments
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      setText("");
      setError("Comment posted successfully!");
    },
    onError: (error) => {
      setError("Failed to submit comment. Please try again.");
      console.error("Comment submission error:", error);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim() || !text.trim()) {
      setError("Name and comment are required.");
      return;
    }
    
    if (addComment.isPending) {
      setError("Please wait...");
      return;
    }
    
    addComment.mutate({ name, content: text });
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border bg-background px-3 py-2"
            aria-label="Your name"
          />
          <div className="sm:col-span-2">
            <input
              placeholder="Write a comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
              aria-label="Comment"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Post</button>
      </form>

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground">Be the first to comment.</li>
        )}
      </ul>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: any }) => {
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", comment.id],
    queryFn: () => fetchReplies(comment.id),
  });

  return (
    <li className="space-y-3">
      <div className="rounded-md border p-3">
        <div className="text-sm font-medium">
          {comment.name} 
          <span className="text-muted-foreground">
            · {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
        <p className="text-sm mt-1">{comment.content}</p>
      </div>
      
      {replies.length > 0 && (
        <div className="ml-6 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-md border p-3 bg-muted/50">
              <div className="text-sm font-medium">
                {reply.is_admin_reply ? (
                  <span className="text-primary font-bold">{reply.name} (VineVid)</span>
                ) : (
                  reply.name
                )}
                <span className="text-muted-foreground">
                  · {new Date(reply.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-1">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </li>
  );
};
