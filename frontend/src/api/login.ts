import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

const API_URL = import.meta.env.VITE_API_URL

export const useLoginMutation = (
  onSuccess: (data: LoginResponse) => void,
  onError?: (err: any) => void
) => {//a post request made using axios to backend
  return useMutation<LoginResponse, any, LoginRequest>({
    mutationFn: async ({ email, password }) => {
       const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      return res.data
    },
    onSuccess,
    onError,
  })
}
