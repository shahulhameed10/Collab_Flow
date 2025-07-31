
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/api/tasks";
import { toast } from "react-hot-toast";
import type { Task } from "@/api/tasks";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ClipboardCheck, ArrowLeft } from "lucide-react";

export default function CreateTask() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    //make form values empty
    name: "",
    status: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createTask({
        ...form,
        assignedTo: parseInt(form.assignedTo),
        projectId: parseInt(projectId!),
      }),
    onSuccess: async (task: Task) => {
      toast.success("✅ Task created successfully!");
      queryClient.setQueryData<Task[]>(
        ["tasks", task.projectId],
        (old = []) => [...old, task]
      );
      await queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      setOpenDialog(true);
    },
    onError: () => {
      toast.error("❌ Failed to create task");
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e2eafc] via-[#fbeeff] to-[#f5faff] p-4 flex justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center mb-4 gap-2">
          <ClipboardCheck className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold text-gray-800">
            Create Task for Project #{projectId}
          </h1>
        </div>

        {/* Task Name */}
        <div>
          <Label className="text-sm text-gray-600">Task Name</Label>
          <Input
            className="mt-1"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        {/* Priority */}
        <div>
          <Label className="text-sm text-gray-600">Priority</Label>
          <Select onValueChange={(value) => handleChange("priority", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="text-sm text-gray-600">Status</Label>
          <Select onValueChange={(value) => handleChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div>
          <Label className="text-sm text-gray-600">Due Date</Label>
          <Input
            type="date"
            className="mt-1"
            value={form.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
        </div>

        {/* Assigned To */}
        <div>
          <Label className="text-sm text-gray-600">Assigned User ID</Label>
          <Input
            className="mt-1"
            value={form.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            placeholder="Enter User ID"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
        >
          {createMutation.isPending ? "Creating..." : "Create Task"}
        </Button>

        {/* Back to Project */}
        <Button
          variant="ghost"
          className="text-indigo-500 hover:underline justify-center w-full"
          onClick={() => navigate(`/dashboard/workspace/${projectId}/projects`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Created</DialogTitle>
              <DialogDescription>
                The task has been successfully created.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() =>
                  navigate(`/dashboard/project/${projectId}/view-task`)
                }
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
