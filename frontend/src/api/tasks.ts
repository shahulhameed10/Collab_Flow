import axios from "@/lib/axios";

export interface Task {
  id: number;
  name: string;
  status: string;
  priority: string;
  labels?: string;
  dueDate: string;
  assignedTo: number;
  projectId: number;
}

// Create a task under a specific project
export const createTask = async (data: {
  name: string;
  status?: string;
  priority?: string;
  labels?: string;
  dueDate: string;
  assignedTo: number;
  projectId: number;
}) => {
  const res = await axios.post("http://localhost:5000/api/tasks", data);
  return res.data.task || res.data;
};

//get task under project
export const getTasks = async (params?: { projectId?: number }) => {
  const res = await axios.get("/api/tasks", { params });
  return res.data.tasks || res.data;
};


// Update a task by ID
export const updateTask = async (
  id: number,
  data: Partial<{
    name: string;
    status: string;
    priority: string;
  }>
) => {
  console.log("Updating Task:", id, data);
  const res = await axios.put(`/api/tasks/${id}`, data);
  return res.data.task || res.data;
};

// Delete a task by ID
export const deleteTask = async (id: number) => {
  const res = await axios.delete(`/api/tasks/${id}`);
  return res.data;
};
