import axios from "@/lib/axios"

// Create a project under a specific workspace
export const createProject = async (data: {
  name: string;
  description?: string;
  deadline?: string;
  workspaceId: number;
}) => {
  const res = await axios.post("/api/projects", {
    name: data.name,
    description: data.description,
    deadline: data.deadline ? new Date(data.deadline) : null,
    workspaceId:data.workspaceId,
  });
  return res.data;
};

// ✅ Get projects scoped to a specific workspace
export const getProjectsByWorkspace = async (workspaceId: string|number) => {
  const res = await axios.get(`/api/projects/workspace/${workspaceId}`);
  return res.data.projects||res.data;
};

// ✅ Update a project by ID
export const updateProject = async (id: number, data: any) => {
  const res = await axios.put(`/api/projects/${id}`, data);
  return res.data;
};

// ✅ Delete a project by ID
export const deleteProject = async (id: number) => {
  const res = await axios.delete(`/api/projects/${id}`);
  return res.data;
};
