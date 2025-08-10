import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const ImageUploader = ({
  bucket = "posters",
  onUploaded,
  label = "Upload Image",
}: {
  bucket?: string;
  onUploaded: (publicUrl: string, path: string) => void;
  label?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPick = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(data.publicUrl, path);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <div className="flex items-center gap-2">
        <Button type="button" onClick={onPick} disabled={uploading}>{uploading ? "Uploading..." : label}</Button>
        <Input readOnly placeholder="No file selected" onClick={onPick} aria-label="Selected file" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default ImageUploader;
