import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

//create axios instance 
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Attach token to every req
instance.interceptors.request.use((config) => {
  //fetch token from authstore
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
