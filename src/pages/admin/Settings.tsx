import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { useState } from "react";

const fetchSettings = async () => {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
};

const Settings = () => {
  const { data: s, refetch } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchSettings });
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [themeColor, setThemeColor] = useState("#FF6A00");
  const [logo, setLogo] = useState<string | null>(null);
  const [darkDefault, setDarkDefault] = useState(false);
  const [footerLinks, setFooterLinks] = useState("{}");
  const [splashTagline, setSplashTagline] = useState("");

  useState(() => {
    if (s) {
      setSiteName(s.site_name ?? "");
      setTagline(s.tagline ?? "");
      setThemeColor(s.theme_color ?? "#FF6A00");
      setLogo(s.logo_url ?? null);
      setDarkDefault(s.dark_mode_default ?? false);
      setFooterLinks(JSON.stringify(s.footer_links ?? {}, null, 2));
      setSplashTagline(s.splash_tagline ?? "");
    }
  });

  const save = useMutation({
    mutationFn: async () => {
      let links: any = {};
      try { links = JSON.parse(footerLinks || "{}"); } catch {}
      const { error } = await supabase.from("site_settings").update({
        site_name: siteName,
        tagline,
        theme_color: themeColor,
        logo_url: logo,
        dark_mode_default: darkDefault,
        footer_links: links,
        splash_tagline: splashTagline,
      }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => refetch(),
  });

  return (
    <>
      <Helmet>
        <title>Site Settings | VineVid</title>
        <meta name="description" content="Admin: customize site colors, logo, and text" />
        <link rel="canonical" href={`${location.origin}/admin/settings`} />
      </Helmet>
      <Header />
      <main className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">Site Customization</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Brand</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              <Input placeholder="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
              <div>
                <label className="text-sm">Theme color</label>
                <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
              </div>
              {logo && <img src={logo} alt="Logo preview" className="h-12" />}
              <ImageUploader bucket="site-assets" onUploaded={(url) => setLogo(url)} label="Upload Logo" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Layout</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={darkDefault} onChange={(e) => setDarkDefault(e.target.checked)} /> Dark mode by default</label>
              <div>
                <label className="text-sm">Footer Links (JSON)</label>
                <textarea className="w-full rounded-md border bg-background p-2 font-mono text-sm" rows={6} value={footerLinks} onChange={(e) => setFooterLinks(e.target.value)} />
              </div>
              <Input placeholder="Splash tagline" value={splashTagline} onChange={(e) => setSplashTagline(e.target.value)} />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save Settings</Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Settings;
