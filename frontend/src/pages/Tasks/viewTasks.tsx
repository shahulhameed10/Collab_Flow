import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getTasks, updateTask, deleteTask } from "@/api/tasks";
import { getComments, addComment } from "@/api/taskcomments";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Task } from "@/api/tasks";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle, MessageSquarePlus, Pencil, Trash2, AlertCircle, CircleDot, ClipboardList
} from "lucide-react";

export default function ViewTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numericProjectId = Number(projectId);

  const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
  const [viewCommentsTaskId, setViewCommentsTaskId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  //cache for tasks
  const { data: tasks = [], isLoading } = useQuery<Task[], Error>({
    queryKey: ["tasks", numericProjectId],
    queryFn: () => getTasks({ projectId: numericProjectId }),
    enabled: !!numericProjectId,
  });

  //cache for comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", viewCommentsTaskId],
    queryFn: () => getComments(viewCommentsTaskId!),
    enabled: !!viewCommentsTaskId,
  });

  const commentMutation = useMutation({
    mutationFn: ({ taskId, content }:
      {
        taskId: number;
        content: string
      }) => addComment(taskId, content),
    onSuccess: () => {
      setNewComment("");
      setCommentTaskId(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }:
      {
        id: number;
        data: Partial<Task>

      }) => updateTask(id, data),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", numericProjectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks", numericProjectId]);
      queryClient.setQueryData<Task[]>(["tasks", numericProjectId], (old = []) =>
        old.map((task) => task.id === updatedTask.id ? { ...task, ...updatedTask.data } : task)
      );
      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", numericProjectId], context.previousTasks);
      }
    },
    onSuccess: () => setEditingTask(null),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks", numericProjectId] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", numericProjectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks", numericProjectId]);
      queryClient.setQueryData<Task[]>(["tasks", numericProjectId], (old = []) =>
        old.filter((task) => task.id !== taskId)
      );
      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", numericProjectId], context.previousTasks);
      }
    },
    onSuccess: () => setDeleteTaskId(null),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks", numericProjectId] }),
  });

  if (isLoading) return <p className="p-4">Loading tasks...</p>;

  const cardColors = [
    "bg-[#332D56]",
    "bg-[#0ABAB5]",
    "bg-[#8576FF]",
    "bg-[#B03060]",
    "bg-[#1B4242]",
  ];

  const getPriorityColor = (priority: string) => {
    return priority === "High"
      ? "text-red-300"
      : priority === "Medium"
        ? "text-yellow-300"
        : "text-green-300";
  };

  return (
    <div className="p-4 min-h-screen bg-white">
      {/* 🔄 UPDATED HEADER SECTION */}
      <div className="bg-white px-6 py-4 shadow-md sticky top-0 z-10 mb-8">
        <div className="flex items-center justify-between">
          {/* Left: Icon + Gradient Text */}
          <div className="flex items-center gap-3">
            <ClipboardList size={28} className="text-purple-700" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
              Your Project’s Tasks
            </h1>
          </div>
          {/* Right: Back Button */}

          <Button
            variant="outline"
            className="font-semibold text-purple-700 border-purple-600 hover:bg-purple-50"
            onClick={() => navigate(-1)}
          >
            ← Back to Projects
          </Button>
        </div>
      </div>

      {/* 🧱 TASK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`relative rounded-3xl shadow-xl backdrop-blur-lg text-white transition-transform hover:scale-105 overflow-hidden ${cardColors[index % cardColors.length]}`}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={() => setCommentTaskId(task.id)} className="hover:text-white/80">
                <MessageSquarePlus size={18} />
              </button>
              <button onClick={() => setViewCommentsTaskId(task.id)} className="hover:text-white/80">
                <MessageCircle size={18} />
              </button>
              <button onClick={() => setEditingTask({ ...task })} className="hover:text-white/80">
                <Pencil size={18} />
              </button>
              <button onClick={() => setDeleteTaskId(task.id)} className="hover:text-white/80">
                <Trash2 size={18} />
              </button>
            </div>

            {/* Folder Tab */}
            <div className="w-1/2 h-9 bg-black/40 rounded-br-3xl pl-4 pt-2 text-white font-bold text-lg">
              {task.name}
            </div>

            <CardContent className="p-4 mt-2 space-y-3">
              <p className="flex items-center gap-2 text-base">
                <CircleDot size={16} />
                <span className="font-medium">{task.status}</span>
              </p>
              <p className={`flex items-center gap-2 text-base ${getPriorityColor(task.priority)}`}>
                <AlertCircle size={16} />
                <span className="font-medium">{task.priority}</span>
              </p>
            </CardContent>
          </div>
        ))}
      </div>
      
      {/* Add Comment Dialog */}
      <Dialog open={!!commentTaskId} onOpenChange={() => setCommentTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>Add a comment to the task</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <DialogFooter className="mt-2">
            <Button onClick={() => {
              if (!newComment.trim()) return;
              commentMutation.mutate({ taskId: commentTaskId!, content: newComment });
            }}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Comments Dialog */}
      <Dialog open={!!viewCommentsTaskId} onOpenChange={() => setViewCommentsTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recent Comments</DialogTitle>
            <DialogDescription>See comments for this task</DialogDescription>
          </DialogHeader>
          {commentsLoading ? (
            <p>Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((c: any) => (
                <div key={c.id} className="p-2 border rounded">
                  <p className="text-sm">{c.content}</p>
                  <p className="text-xs text-muted-foreground">
                    — {c.author?.email || "Unknown"} on {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <Input
            value={editingTask?.name || ""}
            onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
            placeholder="Task Name"
          />
          <Select
            value={editingTask?.status || ""}
            onValueChange={(val) => setEditingTask({ ...editingTask, status: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Testing">Testing</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={editingTask?.priority || ""}
            onValueChange={(val) => setEditingTask({ ...editingTask, priority: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="mt-2">
            <Button onClick={() => {
              if (editingTask) {
                const { id, name, status, priority } = editingTask;
                updateTaskMutation.mutate({ id, data: { name, status, priority } });
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="destructive" onClick={() => {
              if (deleteTaskId !== null) deleteTaskMutation.mutate(deleteTaskId);
            }}>Yes, Delete</Button>
            <Button variant="outline" onClick={() => setDeleteTaskId(null)}>Cancel</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
