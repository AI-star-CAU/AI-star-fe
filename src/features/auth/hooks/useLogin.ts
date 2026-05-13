import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { extractAuthErrorMessage } from '../utils/errorMessage';
import type { LoginCredentials } from '../types';

interface UseLoginOptions {
  onSuccess?: () => void;
}

export const useLogin = ({ onSuccess }: UseLoginOptions = {}) => {
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error ? extractAuthErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
};
