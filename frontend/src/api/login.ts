import { useMutation } from "@tanstack/react-query"
import axios from "axios"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export const useLoginMutation = (
  onSuccess: (data: LoginResponse) => void,
  onError?: (err: any) => void
) => {//a post request made using axios to backend
  return useMutation<LoginResponse, any, LoginRequest>({
    mutationFn: async ({ email, password }) => {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password })
      return res.data
    },
    onSuccess,
    onError,
  })
}
