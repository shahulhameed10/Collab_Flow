import { toast } from "sonner";

export function useToaster() {
  return {
    toast,
    success: (message: string) =>
      toast.success(message),
    error: (message: string) =>
      toast.error(message),
    info: (message: string) =>
      toast(message),
  };
}
