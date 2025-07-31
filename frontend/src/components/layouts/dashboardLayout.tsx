import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
  LogOut,
  Plus,
  Edit,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import { socket } from "@/lib/socket";

export default function DashboardLayout() {
  const [menu, setMenu] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Workspace",
      icon: <Briefcase className="w-5 h-5 text-white" />,
      color: "from-purple-400 to-indigo-400",
      children: [
        {
          name: "Create Workspaces",
          path: "/dashboard/workspaces",
          icon: <Plus className="w-4 h-4 mr-2 text-whitee-600" />,
          btnColor: "bg-sky-400 text-white hover:bg-sky-600",
        },
        {
          name: "View & Edit Workspaces",
          path: "/dashboard/workspaces/edit",
          icon: <Edit className="w-4 h-4 mr-2 text-white" />,
          btnColor: "bg-emerald-400 text-white hover:bg-emerald-600",
        },
      ],
    },
    {
      label: "Users",
      icon: <Users className="w-5 h-5 text-white" />,
      color: "from-cyan-400 to-blue-400",
      children: [
        {
          name: "Create Users",
          path: "/dashboard/users/create",
          icon: <UserPlus className="w-4 h-4 mr-2 text-white" />,
          btnColor: "bg-sky-400 text-white hover:bg-sky-600",
        },
        {
          name: "View & Edit User Roles",
          path: "/dashboard/users/view",
          icon: <ShieldCheck className="w-4 h-4 mr-2 text-white" />,
          btnColor: "bg-emerald-300 text-white hover:bg-emerald-600",
        },
      ],
    },
  ];

  useEffect(() => { //listens websocket events 
    if (!socket) return;

    socket.on("new-task", (task) => {
      console.log("📥 socket received new-task:", task);
      toast.success(`🆕 Task Created: ${task.name}`);
    });

    socket.on("new-comment", (comment) => {
      console.log("💬 socket received new-comment:", comment);
      toast.success(`💬 New Comment on Task ${comment.taskId}: ${comment.content}`);
    });

    return () => {
      socket.off("new-task");
      socket.off("new-comment");
    };
  }, []);

  const handleLogout = () => {
    logout();         // clear Zustand store
    navigate("/login");
    localStorage.removeItem("auth-storage");

  };

  return (
    <div className="flex min-h-screen font-poppins bg-gradient-to-r from-slate-100 to-white">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white/80 backdrop-blur-md p-6 shadow-lg flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 mb-6 tracking-tight">
            CollabFlow
          </h1>

          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4 text-muted-foreground border-b pb-2">
            <LayoutDashboard className="h-5 w-5 text-green-600" />
            Navigation
          </h2>

          <div className="space-y-4">
            {navItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setMenu((prev) => (prev === item.label ? "" : item.label))
                  }
                  className={cn(
                    "flex items-center w-full gap-2 text-left p-3 rounded-lg text-white font-semibold transition-all",
                    `bg-gradient-to-r ${item.color}`,
                    menu === item.label ? "opacity-90" : "hover:opacity-90"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto w-4 h-4 transition-transform",
                      menu === item.label && "rotate-180"
                    )}
                  />
                </button>

                {menu === item.label && (
                  <div className="ml-4 mt-3 space-y-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm rounded-lg font-medium transition shadow-sm hover:shadow-md border",
                          child.btnColor
                        )}
                      >
                        {child.icon}
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="destructive"
          className="mt-6 flex items-center gap-2"
          onClick={handleLogout} // ✅ connected
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-center px-6 py-4 border-b bg-white/70 backdrop-blur-md shadow-sm">
          <div className="text-sm text-muted-foreground text-center">
            Welcome <span className="font-semibold text-blue-600">{user?.name ?? "User"}</span> | Role:{" "}
            <span className="font-semibold text-green-600">{user?.role ?? "N/A"}</span>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
