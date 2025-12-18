import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const showInfo = (message: string) => { // Added showInfo function
  toast.info(message); // Using toast.info for informational messages
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};