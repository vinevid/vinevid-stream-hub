import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

async function fetchCounts() {
  const vids = await supabase.from("videos").select("id", { count: "exact", head: true });
  const cmts = await supabase.from("comments").select("id", { count: "exact", head: true });
  const recent = await supabase
    .from("videos")
    .select("id,title,created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return {
    videos: vids.count ?? 0,
    comments: cmts.count ?? 0,
    recent: recent.data ?? [],
  };
}

const AdminDashboard = () => {
  const { data } = useQuery({ queryKey: ["admin-counts"], queryFn: fetchCounts });

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | VineVid</title>
        <meta name="description" content="Admin overview for VineVid" />
        <link rel="canonical" href={`${location.origin}/admin`} />
      </Helmet>
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button asChild><Link to="/admin/videos/new">Add New Video</Link></Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Total Videos</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{data?.videos ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Comments</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{data?.comments ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recently Added</CardTitle></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                {(data?.recent ?? []).map((r: any) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <span className="truncate pr-3">{r.title}</span>
                    <Link className="text-primary text-xs" to={`/video/${r.id}`}>View</Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
