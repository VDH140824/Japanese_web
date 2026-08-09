import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton, AuthShell, EmailIcon, LockIcon, TextField } from "../../components/ui/auth";
import { useForgotPassword, useVerifyOtp, useResetPassword } from "../../hooks/useAuth";

// ─── Step 1: Enter Email ──────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type EmailFormValues = z.infer<typeof emailSchema>;

// ─── Step 2: Enter OTP ────────────────────────────────────────────────────────
const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
type OtpFormValues = z.infer<typeof otpSchema>;

// ─── Step 3: New Password ─────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    password: z.string().min(1, "Password is required").min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Mutations
  const { mutate: sendOtp, isPending: isSending, error: sendError } = useForgotPassword();
  const { mutate: verifyOtp, isPending: isVerifying, error: verifyError } = useVerifyOtp();
  const { mutate: resetPassword, isPending: isResetting, isSuccess: resetSuccess, error: resetError } = useResetPassword();

  // ─── Step 1 Form ──────────────────────────────────────────────────────────
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSendOtp = (values: EmailFormValues) => {
    sendOtp(
      { email: values.email },
      {
        onSuccess: () => {
          setEmail(values.email);
          setStep(2);
        },
      },
    );
  };

  // ─── Step 2 Form ──────────────────────────────────────────────────────────
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onVerifyOtp = (values: OtpFormValues) => {
    verifyOtp(
      { email, otp: values.otp },
      {
        onSuccess: () => {
          setOtp(values.otp);
          setStep(3);
        },
      },
    );
  };

  // ─── Step 3 Form ──────────────────────────────────────────────────────────
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onResetPassword = (values: PasswordFormValues) => {
    resetPassword({
      token: otp,
      newPassword: values.password,
      confirmPassword: values.confirmPassword,
    });
  };

  const getError = (err: unknown) => {
    if (!err) return null;
    return (
      (err as any).response?.data?.message ??
      (err as Error).message ??
      "Something went wrong. Please try again."
    );
  };

  // ─── Step Titles ──────────────────────────────────────────────────────────
  const titles: Record<number, { title: string; desc: string }> = {
    1: { title: "Forgot password 🔑", desc: "Enter your email and we'll send you a verification code." },
    2: { title: "Verify OTP 📩", desc: `Enter the 6-digit code sent to ${email}` },
    3: { title: "Reset password 🛡️", desc: "Create a strong new password for your account." },
  };

  return (
    <AuthShell
      title={titles[step].title}
      description={titles[step].desc}
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          Remembered your password?{" "}
          <Link to="/login" className="auth-link">
            Back to sign in
          </Link>
        </p>
      }
    >
      {/* ─── Step 1: Email ──────────────────────────────────────────────── */}
      {step === 1 && (
        <form
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          onSubmit={emailForm.handleSubmit(onSendOtp)}
          noValidate
        >
          {getError(sendError) && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: 13,
              }}
            >
              ⚠️ {getError(sendError)}
            </div>
          )}

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(56,189,248,0.25)",
              fontSize: 13,
              color: "#7dd3fc",
              lineHeight: 1.6,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 18 }}>💡</span>
            <span>We'll send a 6-digit verification code to your email address.</span>
          </div>

          <TextField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<EmailIcon />}
            {...emailForm.register("email")}
            error={emailForm.formState.errors.email?.message}
          />

          <AuthButton type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send verification code →"}
          </AuthButton>

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
            🔒 OTP will be sent to your email via Gmail SMTP.
          </p>
        </form>
      )}

      {/* ─── Step 2: OTP  ──────────────────────────────────────────────── */}
      {step === 2 && (
        <form
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          onSubmit={otpForm.handleSubmit(onVerifyOtp)}
          noValidate
        >
          {getError(verifyError) && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: 13,
              }}
            >
              ⚠️ {getError(verifyError)}
            </div>
          )}

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              fontSize: 13,
              color: "#86efac",
              lineHeight: 1.6,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 18 }}>✅</span>
            <span>A verification code has been sent to <strong>{email}</strong>. Check your inbox.</span>
          </div>

          <TextField
            label="Verification Code (OTP)"
            type="text"
            placeholder="Enter 6-digit code"
            autoComplete="one-time-code"
            icon={<LockIcon />}
            {...otpForm.register("otp")}
            error={otpForm.formState.errors.otp?.message}
          />

          <AuthButton type="submit" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify code →"}
          </AuthButton>

          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(56,189,248,0.9)",
              cursor: "pointer",
              fontSize: 13,
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            ← Resend or use a different email
          </button>
        </form>
      )}

      {/* ─── Step 3: New Password ───────────────────────────────────────── */}
      {step === 3 && (
        <form
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          onSubmit={passwordForm.handleSubmit(onResetPassword)}
          noValidate
        >
          {resetSuccess && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#86efac",
                fontSize: 13,
              }}
            >
              ✅ Password reset successful! Redirecting to login...
            </div>
          )}

          {getError(resetError) && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: 13,
              }}
            >
              ⚠️ {getError(resetError)}
            </div>
          )}

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(14,165,233,0.08)",
              border: "1px solid rgba(56,189,248,0.2)",
              fontSize: 13,
              color: "#7dd3fc",
              lineHeight: 1.6,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 18 }}>🔐</span>
            <span>Use 8+ characters with a mix of letters, numbers and symbols for a strong password.</span>
          </div>

          <TextField
            label="New password"
            type="password"
            placeholder="Create a new password"
            autoComplete="new-password"
            icon={<LockIcon />}
            {...passwordForm.register("password")}
            error={passwordForm.formState.errors.password?.message}
          />

          <TextField
            label="Confirm new password"
            type="password"
            placeholder="Repeat your new password"
            autoComplete="new-password"
            icon={<LockIcon />}
            {...passwordForm.register("confirmPassword")}
            error={passwordForm.formState.errors.confirmPassword?.message}
          />

          <AuthButton type="submit" disabled={isResetting}>
            {isResetting ? "Updating..." : "Update password →"}
          </AuthButton>

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
            🔒 Your password will be securely hashed.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
