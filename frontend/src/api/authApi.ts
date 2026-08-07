import { apiClient } from "../services/api";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
} from "../types/auth";

/**
 * POST /api/auth/register
 * Registers a new user. Backend sends a verification email.
 */
export async function register(payload: RegisterRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/auth/register", payload);
  return data;
}

/**
 * POST /api/auth/login
 * Login with email + password. Returns user info + tokens.
 */
export async function login(payload: LoginRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/auth/login", payload);
  return data;
}

/**
 * POST /api/auth/refresh
 * Exchange a refresh token for a new access token.
 */
export async function refreshToken(
  payload: RefreshTokenRequest,
): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/auth/refresh", payload);
  return data;
}

/**
 * POST /api/auth/logout
 * Invalidates the refresh token cookie on the server.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

/**
 * POST /api/auth/forgot-password
 * Triggers a password-reset email.
 */
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<void> {
  await apiClient.post("/auth/forgot-password", payload);
}

/**
 * POST /api/auth/reset-password
 * Resets the user's password using a token from the email link.
 */
export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<void> {
  await apiClient.post("/auth/reset-password", payload);
}

/**
 * GET /api/auth/verify?token=...
 * Verifies the user's email with the token from the verification email link.
 */
export async function verifyEmail(token: string): Promise<void> {
  await apiClient.get("/auth/verify", { params: { token } });
}

/**
 * GET /api/users/me
 * Returns the currently authenticated user's profile.
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>("/users/me");
  return data;
}
