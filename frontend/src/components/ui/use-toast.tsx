// src/hooks/use-toaster.ts
import { toast } from "sonner";

export const useToast = () => {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    custom: (message: string, options?: Parameters<typeof toast>[1]) =>
      toast(message, options),
  };
};
