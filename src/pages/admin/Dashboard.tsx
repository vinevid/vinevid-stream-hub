import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Video, MessageSquare, TrendingUp, Plus } from "lucide-react";

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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your content.</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/admin/videos/new">
              <Plus className="h-4 w-4" />
              Add New Video
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.videos ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active series & episodes</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.comments ?? 0}</div>
              <p className="text-xs text-muted-foreground">User engagement</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.recent?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">New additions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Recently Added Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recent && data.recent.length > 0 ? (
              <div className="space-y-3">
                {data.recent.map((video: any) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/video/${video.id}`}>View</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/videos/${video.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No videos added yet</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to="/admin/videos/new">Add your first video</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
