import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

interface WorkspacePayload {
  name: string;
  brandingLogo: string;
  members: string[];
  projectName?: string;
}

interface WorkspaceResponse {
  message: string;
  workspace: {
    id: number;
    name: string;
    ownerId: number;
    brandingLogo: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const fetchUsers = async (): Promise<{ id: number; email: string }[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("❌ No auth token found");

  const res = await axios.get(`${BASE_URL}/api/auth/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const createWorkspace = async (
  payload: WorkspacePayload
): Promise<WorkspaceResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("❌ No auth token found");

  try {
    const res = await axios.post<WorkspaceResponse>(
      `${BASE_URL}/api/workspaces`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("❌ Error in createWorkspace API:", error?.response?.data || error);
    throw error;
  }
};

export const getAllWorkspaces = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const res = await axios.get(`${BASE_URL}/api/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateWorkspace = async ({ id, name, brandingLogo }: any) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/workspaces/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, brandingLogo }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

export const deleteWorkspace = async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/workspaces/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};
