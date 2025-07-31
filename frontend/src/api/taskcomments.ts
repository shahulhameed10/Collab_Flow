import axios from "@/lib/axios";

// Get comments for a specific task
export const getComments = async (taskId: number) => {
  const res = await axios.get(`/api/comments/${taskId}`);
  return res.data;
};

// Add a comment to a specific task
export const addComment = async (taskId: number, content: string) => {
  const res = await axios.post(`/api/comments/${taskId}`, { content }); 
  return res.data;
};
