import { useToast as useToastFromContext } from '../context/ToastContext';

/**
 * Convenience hook for displaying toast notifications.
 * @returns {Function} showToast(message, type)
 */
export const useToast = () => {
  return useToastFromContext();
};
