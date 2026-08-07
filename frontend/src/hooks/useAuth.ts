import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import * as authApi from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/auth";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const authKeys = {
  me: ["auth", "me"] as const,
};

// ─── useCurrentUser ───────────────────────────────────────────────────────────
/**
 * Fetches the authenticated user from GET /api/users/me.
 * Only runs when the user is already authenticated (has an access token).
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const user = await authApi.getCurrentUser();
      // Sync fresh user profile into store (tokens already set)
      const token = useAuthStore.getState().accessToken ?? "";
      const refresh = useAuthStore.getState().refreshToken ?? undefined;
      setAuth(user, token, refresh);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

// ─── useLogin ─────────────────────────────────────────────────────────────────
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      const accessToken = data.accessToken ?? "";
      const refreshToken = data.refreshToken ?? undefined;
      setAuth(data, accessToken, refreshToken);
      queryClient.setQueryData(authKeys.me, data);
      // Redirect to the page the user was originally trying to access, or /home
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/home";
      navigate(from, { replace: true });
    },
  });
}


// ─── useRegister ──────────────────────────────────────────────────────────────
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: () => {
      navigate("/verify-email");
    },
  });
}

// ─── useLogout ────────────────────────────────────────────────────────────────
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Clear regardless of server response
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
  });
}

// ─── useForgotPassword ────────────────────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) =>
      authApi.forgotPassword(payload),
  });
}

// ─── useResetPassword ─────────────────────────────────────────────────────────
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) =>
      authApi.resetPassword(payload),
    onSuccess: () => {
      navigate("/login");
    },
  });
}

// ─── useVerifyEmail ───────────────────────────────────────────────────────────
export function useVerifyEmail() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      navigate("/login");
    },
  });
}
