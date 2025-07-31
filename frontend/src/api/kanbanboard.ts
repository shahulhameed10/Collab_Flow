import instance from "@/lib/axios";

export const fetchTasks = async (projectId: string | undefined) => {
  const res = await instance.get("/api/tasks", {
    params: { projectId },
  });
  return res.data.tasks ?? [];
};

// ✅ Update the status of a task
export const updateTaskStatus = async (id: string, newStatus: string) => {
  const response = await instance.put(`/api/tasks/${id}/status`, {
    newStatus,
  });
  return { id, newStatus, ...response.data };
};
