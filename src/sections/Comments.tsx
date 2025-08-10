import { useMemo, useState } from "react";

export const Comments = ({ videoId }: { videoId: string }) => {
  const storageKey = `vinevid_comments_${videoId}`;
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]") as Array<{name: string; text: string; at: number}>;
    } catch {
      return [] as Array<{name: string; text: string; at: number}>;
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const lastAt = Number(localStorage.getItem("vinevid_last_comment_at") || 0);
    if (Date.now() - lastAt < 20_000) {
      setError("Please wait a few seconds before posting again.");
      return;
    }
    if (!name.trim() || !text.trim()) {
      setError("Name and comment are required.");
      return;
    }
    const next = [{ name: name.trim(), text: text.trim(), at: Date.now() }, ...items].slice(0, 100);
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    localStorage.setItem("vinevid_last_comment_at", String(Date.now()));
    setText("");
  };

  const list = useMemo(() => items.sort((a, b) => b.at - a.at), [items]);

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
        {list.map((c, idx) => (
          <li key={idx} className="rounded-md border p-3">
            <div className="text-sm font-medium">{c.name} <span className="text-muted-foreground">· {new Date(c.at).toLocaleString()}</span></div>
            <p className="text-sm mt-1">{c.text}</p>
          </li>
        ))}
        {list.length === 0 && (
          <li className="text-sm text-muted-foreground">Be the first to comment.</li>
        )}
      </ul>
    </div>
  );
};
