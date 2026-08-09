import { apiClient } from "../services/api";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
  VerifyOtpRequest,
  VerifyRegistrationRequest,
} from "../types/auth";

/**
 * POST /api/auth/register
 * Triggers sending registration verification OTP code to user email.
 */
export async function register(payload: RegisterRequest): Promise<void> {
  await apiClient.post("/auth/register", payload);
}

/**
 * POST /api/auth/verify-registration
 * Verifies registration OTP and creates the user account in database.
 */
export async function verifyRegistration(
  payload: VerifyRegistrationRequest,
): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(
    "/auth/verify-registration",
    payload,
  );
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
 * Triggers a password-reset OTP email.
 */
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<void> {
  await apiClient.post("/auth/forgot-password", payload);
}

/**
 * POST /api/auth/verify-otp
 * Verifies the OTP code sent to the user's email.
 */
export async function verifyOtp(
  payload: VerifyOtpRequest,
): Promise<void> {
  await apiClient.post("/auth/verify-otp", payload);
}

/**
 * POST /api/auth/reset-password
 * Resets the user's password using the OTP token.
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
