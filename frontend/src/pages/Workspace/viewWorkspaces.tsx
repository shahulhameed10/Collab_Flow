import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from "@/api/workspace";
import { createProject } from "@/api/project";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Plus, Eye, Trash, User2, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

//split date and time 
const formatDate = (isoDate: string | undefined) => {
  return isoDate ? isoDate.split("T")[0] : "";
};

export default function ViewWorkspaces() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const [editingWorkspace, setEditingWorkspace] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [creatingProjectFor, setCreatingProjectFor] = useState<any | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    deadline: "",
  });
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);

  const {
    data: workspaces = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getAllWorkspaces,
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setEditingWorkspace(null);
      toast.success("✅ Workspace updated successfully");
    },
    onError: () => {
      toast.error("❌ Failed to update workspace");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setConfirmDeleteId(null);
      toast.success("🗑️ Workspace deleted successfully");
    },
    onError: () => {
      toast.error("❌ Failed to delete workspace");
    },
  });

  const projectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (data) => {
      toast.success("🚀 Project created successfully");

      const workspaceId = data.project?.workspaceId ?? creatingProjectFor?.id;

      if (workspaceId) {
        await queryClient.invalidateQueries({
          queryKey: ["projects", String(workspaceId)],
        });
      }

      setCreatingProjectFor(null);
      setProjectForm({ name: "", description: "", deadline: "" });
      setIsCreatingLoading(false);
    },
    onError: () => {
      toast.error("❌ Failed to create project");
      setIsCreatingLoading(false);
    },
  });

  const handleProjectCreate = () => {
    if (!projectForm.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (!creatingProjectFor?.id || isNaN(Number(creatingProjectFor.id))) {
      toast.error("Invalid workspace selected");
      return;
    }

    setIsCreatingLoading(true);
    toast.info("Creating project, please wait...");

    projectMutation.mutate({
      ...projectForm,
      workspaceId: Number(creatingProjectFor.id),
    });
  };

  const gradientColors = [
    "from-purple-500 via-pink-500 to-indigo-500",
    "from-sky-400 via-blue-500 to-cyan-500",
    "from-purple-600 via-pink-600 to-purple-800",
    "from-yellow-400 via-orange-500 to-red-500",
    "from-green-400 via-emerald-500 to-teal-500",
  ];

  if (isLoading) return <div className="text-muted p-4">Loading workspaces...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading workspaces</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}

      <div className="bg-white px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Left: Icon + Gradient Text */}
          <div className="flex items-center gap-3">
            <LayoutDashboard size={28} className="text-purple-700" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
              Your Workspaces
            </h1>
          </div>

          {/* Right: Back Button */}
          <Button
            variant="outline"
            className="font-semibold text-purple-700 border-purple-600 hover:bg-purple-50"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex flex-col p-6 gap-6">
        <div className="w-full grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {workspaces.map((ws: any, index: number) => (
            <Card
              key={ws.id}
              className={`relative rounded-2xl shadow-lg overflow-hidden text-white transition-transform transform hover:scale-105 group w-full`}
            >
              <div
                className={`h-52 p-4 flex flex-col justify-between bg-gradient-to-br ${gradientColors[index % gradientColors.length]}`}
              >
                <div className="flex justify-between items-start">
                  {ws.brandingLogo ? (
                    <div className="w-16 h-16">
                      <img
                        src={ws.brandingLogo}
                        alt="Brand"
                        className="w-full h-full object-cover rounded border border-white/30"
                      />
                    </div>
                  ) : (
                    <div className="text-sm font-semibold">Workspace</div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setEditingWorkspace(ws)} className="hover:text-white/90">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(ws.id)} className="text-red-200 hover:text-red-400">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-1">
                  <h3 className="text-lg font-bold">{ws.name}</h3>

                  {/* HoverCard for invited members */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-2 mt-2 cursor-pointer text-sm">
                        <User2 size={18} className="text-white/90" />
                        <span className="opacity-80">Invited</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white border shadow-md rounded p-3 text-black w-52 text-sm">
                      <p className="font-medium mb-2">Members:</p>
                      <div className="space-y-1">
                        {(ws.invites || []).length === 0 ? (
                          <p className="text-gray-500">No members invited</p>
                        ) : (
                          ws.invites.map((invite: any, i: number) => (
                            <p key={i} className="text-gray-800">{invite.email}</p>
                          ))
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>

              <CardContent className="p-4 bg-white text-black space-y-2 rounded-b-2xl">
                <Button
                  className="w-full text-white bg-purple-600 hover:bg-purple-700 transition"
                  onClick={() => {
                    setCreatingProjectFor(ws);
                    setProjectForm({ name: "", description: "", deadline: "" });
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Create Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/dashboard/workspace/${ws.id}/projects`)}
                >
                  <Eye size={16} className="mr-2" />
                  View Projects
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      {creatingProjectFor && (
        <Dialog open={!!creatingProjectFor} onOpenChange={() => setCreatingProjectFor(null)}>
          <DialogContent className="max-h-screen overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Project in {creatingProjectFor.name}</DialogTitle>
              <DialogDescription>Fill in the details for your new project.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <Input
                disabled={isCreatingLoading}
                value={projectForm.name}
                onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Project Name"
              />
              <Input
                disabled={isCreatingLoading}
                value={projectForm.description}
                onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Project Description"
              />
              <Input
                type="date"
                disabled={isCreatingLoading}
                value={formatDate(projectForm.deadline)}
                onChange={(e) => setProjectForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button onClick={handleProjectCreate} disabled={isCreatingLoading}>
                {isCreatingLoading ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setCreatingProjectFor(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingWorkspace && (
        <Dialog open={!!editingWorkspace} onOpenChange={() => setEditingWorkspace(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Workspace</DialogTitle>
              <DialogDescription>You can modify the workspace name or branding logo below.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <Input
                value={editingWorkspace.name}
                onChange={(e) => setEditingWorkspace({ ...editingWorkspace, name: e.target.value })}
                placeholder="Workspace Name"
              />
              <Input
                value={editingWorkspace.brandingLogo || ""}
                onChange={(e) =>
                  setEditingWorkspace({ ...editingWorkspace, brandingLogo: e.target.value })
                }
                placeholder="Branding Logo URL"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={() =>
                  updateMutation.mutate({
                    id: editingWorkspace.id,
                    name: editingWorkspace.name,
                    brandingLogo: editingWorkspace.brandingLogo,
                  })
                }
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingWorkspace(null)}>
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
              <AlertDialogTitle>Are you sure you want to delete this workspace?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All projects and members will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(confirmDeleteId)}>
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
  );
}
