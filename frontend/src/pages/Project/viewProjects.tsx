import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectsByWorkspace,
  deleteProject,
  updateProject,
} from "@/api/project";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2,KanbanSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const toInputDateFormat = (date: string) => {
  if (!date) return "";
  if (date.includes("T")) return date.slice(0, 10);
  if (date.includes("/")) {
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  }
  return date;
};

const gradients = [
  "from-yellow-400 via-orange-500 to-red-500",
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-pink-400 via-rose-500 to-red-500",
  "from-lime-400 via-emerald-500 to-green-600",
  "from-sky-400 via-blue-500 to-purple-600",
  "from-fuchsia-500 via-pink-500 to-red-400",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-slate-400 via-gray-500 to-zinc-600",
];

const getRandomGradient = () =>
  gradients[Math.floor(Math.random() * gradients.length)];

type Project = {
  id: number;
  name: string;
  description?: string;
  deadline?: string;
};

export default function ViewProjects() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: projectsData,
    isLoading,
    isFetching,
    error,
  } = useQuery<Project[]>({
    queryKey: ["projects", workspaceId],
    queryFn: () => getProjectsByWorkspace(String(workspaceId)),
    enabled: !!workspaceId,
    staleTime: 0,
  });

  const projects = Array.isArray(projectsData) ? projectsData : [];

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: (id) => {
      setDeletingProjectId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      setConfirmDeleteId(null);
      toast.success("🗑️ Project deleted successfully");
    },
    onError: () => {
      toast.error("❌ Failed to delete project");
    },
    onSettled: () => {
      setDeletingProjectId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      name: string;
      description?: string;
      deadline?: string;
    }) => {
      setIsUpdating(true);
      return updateProject(data.id, {
        name: data.name,
        description: data.description,
        deadline: data.deadline,
      });
    },
    onSuccess: async (updatedProject) => {
      await queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      setEditingProject(null);
      toast.success(`✅ "${updatedProject.name}" updated successfully`);
    },
    onError: () => {
      toast.error("❌ Failed to update project");
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  if (!workspaceId)
    return <div className="p-4 text-red-500">Invalid workspace ID</div>;
  if (isLoading)
    return (
      <div className="p-4 text-gray-500 animate-pulse text-sm">
        Loading projects...
      </div>
    );
  if (error)
    return <div className="p-4 text-red-500">Failed to load projects</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KanbanSquare size={28} className="text-purple-700" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
              Your Projects
            </h1>
          </div>
          <Button
            variant="outline"
            className="font-semibold text-purple-700 border-purple-600 hover:bg-purple-50"
            onClick={() => navigate("/dashboard/workspaces/edit")}
          >
            ← Back to Workspaces
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isFetching && (
          <p className="text-sm text-blue-500">🔄 Refreshing project list...</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) =>
            deletingProjectId === project.id ? (
              <div
                key={project.id}
                className="flex items-center justify-center p-10 border rounded-2xl bg-gray-100 animate-pulse"
              >
                <span className="text-gray-500">Deleting...</span>
              </div>
            ) : (
              <Card
                key={project.id}
                className="rounded-xl overflow-hidden shadow-md border border-gray-100 transition hover:shadow-lg bg-white w-full h-64 flex flex-col"
              >
                <div
                  className={`relative bg-gradient-to-br ${getRandomGradient()} text-white px-4 py-4 flex flex-col`}
                  style={{ flexBasis: "60%" }}
                >
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      className="hover:text-white/80 transition"
                      onClick={() => setEditingProject(project)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="hover:text-red-200 transition"
                      onClick={() => setConfirmDeleteId(project.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="text-xs bg-white/30 px-2 py-0.5 rounded w-fit mb-1">
                    📅 {formatDate(project.deadline) || "No deadline"}
                  </div>

                  <div className="mt-3">
                    <h3 className="text-xl font-bold tracking-tight leading-tight">
                      {project.name}
                    </h3>
                    <p className="text-[18px] opacity-95 mt-1 flex gap-1">
                      📌 {project.description || "No description"}
                    </p>
                  </div>
                </div>

                <div
                  className="bg-white px-4 py-3 border-t border-gray-200 flex justify-center items-center gap-3"
                  style={{ flexBasis: "40%" }}
                >
                  <Button
                    size="sm"
                    className="w-28 text-white bg-purple-600 border border-purple-600 rounded-full hover:bg-purple-700 transition"
                    onClick={() => navigate(`/dashboard/project/${project.id}/create-task`)}
                  >
                    ➕ Create
                  </Button>
                  <Button
                    size="sm"
                    className="w-28 text-white bg-[#4E71FF] border border-[#4E71FF] rounded-full hover:bg-[#3b5de4] transition"
                    onClick={() => navigate(`/dashboard/project/${project.id}/view-task`)}
                  >
                    👁️ View
                  </Button>
                  <Button
                    size="sm"
                    className="w-28 text-white bg-[#0ABAB5] border border-[#0ABAB5] rounded-full hover:bg-[#089f9a] transition"
                    onClick={() => navigate(`/dashboard/project/${project.id}/kanban`)}
                  >
                    🧩 Board
                  </Button>
                </div>
              </Card>
            )
          )}
        </div>

        {editingProject && (
          <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Modify the name, description, or deadline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  placeholder="Project Name"
                />
                <Input
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  placeholder="Project Description"
                />
                <Input
                  type="date"
                  value={toInputDateFormat(editingProject.deadline || "")}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, deadline: e.target.value })
                  }
                />
              </div>
              <DialogFooter className="mt-4">
                <Button
                  onClick={() =>
                    updateMutation.mutate({
                      id: editingProject.id,
                      name: editingProject.name,
                      description: editingProject.description,
                      deadline: editingProject.deadline,
                    })
                  }
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setEditingProject(null)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {confirmDeleteId && (
          <AlertDialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(confirmDeleteId!)}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
