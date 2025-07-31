import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, createWorkspace } from "@/api/workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2, Briefcase, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateWorkspacePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [brandingLogo, setBrandingLogo] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");

  const {
    data: allUsers = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (data) => {
      toast.success(`🎉 Workspace "${data.workspace.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      navigate("/dashboard/workspaces");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "❌ Failed to create workspace.");
    },
  });

  const handleCreate = () => {
    if (!name) {
      toast.error("Workspace name is required.");
      return;
    }

    //trigger mutation()
    mutation.mutate({
      name,
      brandingLogo,
      members: selectedMembers,
      projectName,
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#b9d7ff] via-[#d3cfff] to-[#f5faff] p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-4 gap-2">
          <Briefcase className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold text-gray-800">Create Workspace</h1>
        </div>

        {/* Input: Workspace Name */}
        <div>
          <Label className="text-sm text-gray-600">Workspace Name</Label>
          <Input
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Design Team"
          />
        </div>

        {/* Input: Branding Logo */}
        <div>
          <Label className="text-sm text-gray-600">Branding Logo URL</Label>
          <Input
            className="mt-1"
            value={brandingLogo}
            onChange={(e) => setBrandingLogo(e.target.value)}
            placeholder="https://logo.url"
          />
        </div>

        {/* Input: Invite Members */}
        <div>
          <Label className="text-sm text-gray-600">Invite Members</Label>
          {usersLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : (
            <div className="bg-white/60"
>
            <MultiSelect
              selected={selectedMembers}
              onChange={setSelectedMembers}
              options={allUsers.map((user: any) => ({
                label: user.email,
                value: user.email,
              }))}
              placeholder="Select members"
            />
            </div>
          )}
          {usersError && (
            <p className="text-sm text-red-500 mt-1">
              Error loading users: {usersError.message}
            </p>
          )}
        </div>

        {/* Input: Project Name */}
        <div>
          <Label className="text-sm text-gray-600">Initial Project Name</Label>
          <Input
            className="mt-1"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Website Redesign"
          />
        </div>

        {/* Button: Submit */}
        <Button
          onClick={handleCreate}
          disabled={mutation.isPending}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Workspace"
          )}
        </Button>

        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-indigo-500 hover:underline justify-center w-full"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
