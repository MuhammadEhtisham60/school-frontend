import { toast } from "sonner";

/**
 * Reusable utility to handle API success/error toast notifications.
 */
export const apiHandleToaster = {
  /**
   * Display a success toast.
   * @param {string} message
   */
  success: (message) => {
    toast.success(message || "Operation successful!");
  },

  /**
   * Parse and display an error toast from API responses.
   * @param {any} err - The error object (e.g. from RTK Query unwrap or catch)
   * @param {string} [defaultMessage="An error occurred"]
   */
  error: (err, defaultMessage = "An error occurred") => {
    console.error("API Error handled by toaster:", err);

    // Extract error message from various possible error response structures
    const errorMessage =
      err?.data?.message ||
      err?.data?.errors?.[0] ||
      err?.data?.error ||
      err?.message ||
      err?.error ||
      (typeof err === "string" ? err : defaultMessage);

    toast.error(errorMessage);
    return errorMessage;
  },

  /**
   * Wraps an async RTK Query promise or other promise, handling success/error toasts automatically.
   * @param {Promise<any>} promise - Promise to resolve.
   * @param {string} [successMessage] - Custom message on success.
   * @param {string} [defaultErrorMessage] - Default message on failure.
   * @returns {Promise<any>} The unwrapped value, or throws the error.
   */
  wrap: async (promise, successMessage, defaultErrorMessage) => {
    try {
      const response = await promise;
      const msg = successMessage || response?.message || "Operation completed successfully!";
      toast.success(msg);
      return response;
    } catch (err) {
      apiHandleToaster.error(err, defaultErrorMessage);
      throw err;
    }
  },
};

export default apiHandleToaster;
