import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchStats = async () => {
  const [videos, categories, comments] = await Promise.all([
    supabase.from("videos").select("id", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("comments").select("id", { count: "exact" })
  ]);
  
  return {
    videosCount: videos.count || 0,
    categoriesCount: categories.count || 0,
    commentsCount: comments.count || 0,
  };
};

const fetchRecentVideos = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      categories(name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return data;
};

const Dashboard = () => {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });
  const { data: recentVideos = [] } = useQuery({ queryKey: ["admin-recent-videos"], queryFn: fetchRecentVideos });

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | VineVid</title>
        <meta name="description" content="VineVid admin dashboard" />
      </Helmet>
      
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.videosCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.categoriesCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.commentsCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVideos.map((video) => (
                <div key={video.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{video.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {video.categories?.name} · {video.year}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {recentVideos.length === 0 && (
                <div className="text-sm text-muted-foreground">No videos yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;