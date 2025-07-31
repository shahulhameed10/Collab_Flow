import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/statcard";
import {
  Users,
  BarChart3,
  CheckSquare,
  LayoutDashboard,
  Flame,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";


//req for fetch stats details
const fetchStats = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:5000/api/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const users = data?.users ?? 0;
  const tasks = data?.tasks ?? 0;
  const workspaces = data?.workspaces ?? 0;
  const projects = data?.projects ?? 0;
  const recentProjects = data?.recentProjects ?? [];
  const recentTasks = data?.recentTasks ?? [];


  //used usequery state 
  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }


  //map project and tasks then sort and takes last 3 activity
  const recentActivities = [...recentProjects.map((p: any) => ({ ...p, type: 'project' })), ...recentTasks.map((t: any) => ({ ...t, type: 'task' }))]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time insights into your team's performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <StatCard
          icon={<Users className="text-blue-700" />}
          label="Total Users"
          value={users}
          progress={users > 0 ? 100 : 0}
          textColor="text-blue-700"
          gradientFrom="from-blue-100"
          gradientTo="to-blue-300"
        />
        <StatCard
          icon={<BarChart3 className="text-purple-700" />}
          label="Active Projects"
          value={projects}
          progress={projects > 0 ? 60 : 0}
          textColor="text-purple-700"
          gradientFrom="from-pink-100"
          gradientTo="to-purple-200"
        />
        <StatCard
          icon={<CheckSquare className="text-green-700" />}
          label="Total Tasks"
          value={tasks}
          progress={tasks > 0 ? 40 : 0}
          textColor="text-green-700"
          gradientFrom="from-green-100"
          gradientTo="to-green-300"
        />
        <StatCard
          icon={<LayoutDashboard className="text-orange-700" />}
          label="Workspaces"
          value={workspaces}
          progress={workspaces > 0 ? 75 : 0}
          textColor="text-orange-700"
          gradientFrom="from-orange-100"
          gradientTo="to-orange-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 font-semibold text-blue-700">
                <BarChart3 className="w-5 h-5" /> Quick Insights
              </div>
              <ul className="mt-3 space-y-2 text-sm text-blue-900">
                <li>
                  Completion Rate
                  <span className="float-right font-medium text-blue-600">
                    {tasks > 0 ? `2/${tasks}` : "0/0"}
                  </span>
                </li>
                <li>
                  Active Team Members
                  <span className="float-right font-medium text-blue-600">
                    {users}
                  </span>
                </li>
                <li>
                  Avg. Tasks per User
                  <span className="float-right font-medium text-blue-600">
                    {users > 0 ? (tasks / users).toFixed(1) : "0.0"}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 font-semibold text-yellow-700">
                <Flame className="w-5 h-5" /> Recent Activity
              </div>
              <ul className="mt-3 text-sm text-yellow-900 space-y-3">
                {recentActivities.map((item: any) => (
                  <li key={`${item.type}-${item.id}`}>
                    <span className={item.type === 'project' ? "text-green-500" : "text-blue-500"}>•</span>{' '}
                    {item.type === 'project' ? (
                      <>Project <b>"{item.name}"</b> was created</>
                    ) : (
                      <>Task <b>"{item.name}"</b> was created</>
                    )}
                    <div className="text-xs text-yellow-800 ml-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
