import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { fetchTasks, updateTaskStatus } from '@/api/kanbanboard';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CircleDot } from "lucide-react";
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  name: string;
  description: string;
  status: StatusType;
  priority: string;
  assignedTo?: string;
  assignee?: string;
  dueDate: string;
}

const statuses = ['todo', 'in_progress', 'done', 'tested'] as const;
type StatusType = typeof statuses[number];

const statusConfig: Record<StatusType, any> = {
  todo: {
    title: 'To Do', icon: '📋', color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200'
  },
  in_progress: {
    title: 'In Progress', icon: '🚀', color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 to-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200'
  },
  done: {
    title: 'Done', icon: '✅', color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 to-green-100', textColor: 'text-green-700', borderColor: 'border-green-200'
  },
  tested: {
    title: 'Tested', icon: '🎯', color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200'
  }
};

const KanbanPage = () => {
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<StatusType | null>(null);

  //fetch task based on projectid
  const { data } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    enabled: !!projectId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const normalizeStatus = (status: string): StatusType => {
    const lower = status.toLowerCase();
    if (lower === 'pending') return 'todo';
    if (lower === 'in progress' || lower === 'in_progress') return 'in_progress';
    if (lower === 'done') return 'done';
    if (lower === 'tested') return 'tested';
    return 'todo';
  };


  const tasks: Task[] = (Array.isArray(data) ? data : data?.tasks ?? []).map((task: any) => ({
    ...task,
    status: normalizeStatus(task.status),
  }));


  //check persists data from ls
  useEffect(() => {
    if (hasHydrated) {
      console.log("✅ Logged in user:", user);
      console.log("✅ Kanban Tasks:", tasks);
    }
  }, [hasHydrated, user, tasks]);

  
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: StatusType }) =>
      updateTaskStatus(id, newStatus),
    onSuccess: (data) => {
      const { id, newStatus } = data as { id: string; newStatus: StatusType };
      queryClient.setQueryData(['tasks', projectId], (oldTasks: Task[] = []) =>
        oldTasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );
      toast.success(`Task #${id} moved to ${statusConfig[newStatus].title}`);
    },
  });

  const handleUpdateTaskStatus = (id: string, newStatus: StatusType) => {
    updateTaskStatusMutation.mutate({ id, newStatus });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: StatusType) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: StatusType) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) return;

    const role = user?.role ?? '';
    const isAllowed = ['admin', 'manager', 'developer', 'viewer'].includes(role);
    const isAssigned = draggedTask.assignedTo === user?.id || draggedTask.assignee === user?.id;

    if (!isAllowed || (role === 'developer' && !isAssigned)) {
      setAlertMessage('❌ You are not allowed to move this task.');
      setShowAlert(true);
      return;
    }

    handleUpdateTaskStatus(draggedTask.id, newStatus);
    setDraggedTask(null);
  };

  const handleMobileTaskClick = (task: Task) => {
    const role = user?.role ?? '';
    const isAllowed = ['admin', 'manager', 'developer'].includes(role);
    const isAssigned = task.assignedTo === user?.id || task.assignee === user?.id;

    if (!isAllowed || (role === 'developer' && !isAssigned)) {
      setAlertMessage('❌ This task is not assigned to you.');
      setShowAlert(true);
      return;
    }

    setSelectedTask(task);
    setShowStatusPicker(true);
  };

  const handleStatusChange = (newStatus: StatusType) => {
    if (selectedTask && selectedTask.status !== newStatus) {
      handleUpdateTaskStatus(selectedTask.id, newStatus);
    }
    setShowStatusPicker(false);
    setSelectedTask(null);
  };

  if (!hasHydrated) return <div className="p-4 text-gray-500">Loading Kanban...</div>;

  return (
    <div className="min-h-screen w-full overflow-x-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CircleDot size={24} className="text-purple-700" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
            Kanban Board
          </h1>
        </div>
        <Button
          variant="outline"
          className="font-semibold text-purple-700 border-purple-600 hover:bg-purple-50"
          onClick={() => navigate(-1)}
        >
          ↗ View Tasks Page
        </Button>


      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-w-[1200px]">
        {statuses.map((status: StatusType) => {
          const config = statusConfig[status];
          const columnTasks = tasks.filter((t) => t.status === status);
          const isDragOver = dragOverColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`bg-gradient-to-br ${config.bgColor} border ${isDragOver ? 'border-blue-400' : config.borderColor} rounded-xl shadow p-2 flex flex-col max-h-[85vh] overflow-y-auto`}
            >
              <div className={`bg-gradient-to-r ${config.color} text-white px-4 py-2 rounded-t-xl font-semibold flex justify-between items-center`}>
                <span>{config.icon} {config.title}</span>
                <span className="text-xs bg-white text-gray-700 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
              </div>

              <div className="space-y-3 p-2">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleMobileTaskClick(task)}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-move min-h-[120px] flex flex-col justify-between relative transition-transform hover:scale-[1.01]"
                  >
                    <p className="absolute top-2 right-3 text-[10px] font-medium text-gray-400">
                      #{task.id}
                    </p>
                    <p className="text-lg font-bold text-gray-800 mb-2">{task.name}</p>
                    <p className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                      <AlertCircle size={14} className="text-red-500" />
                      Priority: {task.priority}
                    </p>
                    <p className="text-xs text-gray-400">📅 {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={showStatusPicker} onOpenChange={setShowStatusPicker}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Task</AlertDialogTitle>
            <AlertDialogDescription>{selectedTask?.name}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            {statuses.map((status) => {
              const config = statusConfig[status];
              const isCurrent = selectedTask?.status === status;
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isCurrent}
                  className={`w-full p-2 rounded border text-left ${isCurrent ? 'bg-gray-100 text-gray-500' : config.borderColor}`}
                >
                  {config.icon} {config.title}
                </button>
              );
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permission Denied</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KanbanPage;
