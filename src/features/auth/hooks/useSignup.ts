import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { extractAuthErrorMessage } from '../utils/errorMessage';
import type { SignupCredentials } from '../types';

interface UseSignupOptions {
  onSuccess?: () => void;
}

export const useSignup = ({ onSuccess }: UseSignupOptions = {}) => {
  const { signup } = useAuth();

  const mutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => signup(credentials),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return {
    signup: mutation.mutate,
    signupAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error ? extractAuthErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
};
