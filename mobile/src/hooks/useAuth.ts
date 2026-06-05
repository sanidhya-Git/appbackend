import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';
import { useAuthStore } from '../store/slices/authStore';
import { queryKeys } from './useQueryKeys';
import { extractError } from '../api/client';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.user, res.data.tokens);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      }
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}

export function useVerifyOTP() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyOTP(email, otp),
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.user, res.data.tokens);
      }
    },
  });
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendOTP(email),
  });
}

export function useGoogleAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (idToken: string) => authApi.googleAuth(idToken),
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.user, res.data.tokens);
      }
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
