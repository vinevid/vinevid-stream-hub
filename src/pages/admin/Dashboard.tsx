import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageSquare, Users, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Videos",
      value: "24",
      description: "Videos in the database",
      icon: Video,
      trend: "+2 this week"
    },
    {
      title: "Comments",
      value: "156",
      description: "User comments",
      icon: MessageSquare,
      trend: "+12 this week"
    },
    {
      title: "Active Users",
      value: "89",
      description: "Users this month",
      icon: Users,
      trend: "+5 this week"
    },
    {
      title: "Growth",
      value: "12%",
      description: "Monthly growth",
      icon: TrendingUp,
      trend: "+3% from last month"
    }
  ];

  const recentActivity = [
    { action: "New video added", item: "Squid Game Episode 9", time: "2 hours ago" },
    { action: "Comment posted", item: "Business Proposal Episode 1", time: "4 hours ago" },
    { action: "User registered", item: "john.doe@email.com", time: "6 hours ago" },
    { action: "Video updated", item: "Hometown Cha-Cha-Cha Episode 5", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's what's happening with your site.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
