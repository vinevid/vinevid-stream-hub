import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type EpisodeItem = {
  id?: string;
  label: string;
  url: string;
  subtitle_url?: string;
  sort_order: number;
};

export const DownloadsEditor = ({
  items,
  onChange,
}: {
  items: EpisodeItem[];
  onChange: (next: EpisodeItem[]) => void;
}) => {
  const add = () => {
    const next = [...items, { label: `Ep ${items.length + 1}`, url: "", sort_order: items.length }];
    onChange(next);
  };
  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx).map((x, i) => ({ ...x, sort_order: i }));
    onChange(next);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [m] = next.splice(idx, 1);
    next.splice(to, 0, m);
    onChange(next.map((x, i) => ({ ...x, sort_order: i })));
  };
  const update = (idx: number, patch: Partial<EpisodeItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Episodes / Download Links</h4>
        <Button type="button" variant="secondary" onClick={add}>Add Episode</Button>
      </div>
      <div className="space-y-3">
        {items.map((ep, idx) => (
          <div key={idx} className="grid gap-2 md:grid-cols-[140px_1fr_1fr_auto] items-center border rounded-md p-3">
            <Input value={ep.label} onChange={(e) => update(idx, { label: e.target.value })} placeholder="Label (e.g. Ep 1)" />
            <Input value={ep.url} onChange={(e) => update(idx, { url: e.target.value })} placeholder="Download URL" />
            <Input value={ep.subtitle_url || ""} onChange={(e) => update(idx, { subtitle_url: e.target.value })} placeholder="Subtitle URL (optional)" />
            <div className="flex gap-2 justify-end">
              <Button type="button" size="icon" variant="outline" onClick={() => move(idx, -1)} aria-label="Move up">↑</Button>
              <Button type="button" size="icon" variant="outline" onClick={() => move(idx, 1)} aria-label="Move down">↓</Button>
              <Button type="button" size="icon" variant="destructive" onClick={() => remove(idx)} aria-label="Remove">✕</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No episodes yet. Click "Add Episode".</p>
        )}
      </div>
    </div>
  );
};

export default DownloadsEditor;
