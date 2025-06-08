import { toast } from "sonner";

export function useToast() {
  return {
    toast: toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    loading: toast.loading,
    dismiss: toast.dismiss,
  };
}
