// api/stats.ts
import axios from "axios";

export const fetchStats = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("/api/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
