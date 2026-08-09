import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthButton,
  AuthShell,
  EmailIcon,
  LockIcon,
  TextField,
  UserIcon,
} from "../../components/ui/auth";
import { useRegister, useVerifyRegistration } from "../../hooks/useAuth";

// ─── Step 1: Register Form Schema ─────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required").min(2, "Minimum 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Step 2: OTP Form Schema ──────────────────────────────────────────────────
const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [userEmail, setUserEmail] = useState("");

  // Mutations
  const { mutate: registerUser, isPending: isRegistering, error: registerError } = useRegister();
  const { mutate: verifyOtp, isPending: isVerifying, error: verifyError } = useVerifyRegistration();

  // ─── Step 1 Form ──────────────────────────────────────────────────────────
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerUser(
      {
        username: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => {
          setUserEmail(values.email);
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

  const onOtpSubmit = (values: OtpFormValues) => {
    verifyOtp({
      email: userEmail,
      otp: values.otp,
    });
  };

  const getError = (err: unknown) => {
    if (!err) return null;
    return (
      (err as any).response?.data?.message ??
      (err as Error).message ??
      "An error occurred. Please try again."
    );
  };

  return (
    <AuthShell
      title={step === 1 ? "Create your account ✨" : "Verify Registration OTP 📩"}
      description={
        step === 1
          ? "Start your Japanese learning journey today — it's free!"
          : `Enter the 6-digit verification code sent to ${userEmail}`
      }
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      }
    >
      {step === 1 ? (
        /* ─── Step 1: Account Information ──────────────────────────────────── */
        <form
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
          onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          noValidate
        >
          {getError(registerError) && (
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
              ⚠️ {getError(registerError)}
            </div>
          )}

          <TextField
            label="Full name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            icon={<UserIcon />}
            {...registerForm.register("name")}
            error={registerForm.formState.errors.name?.message}
          />

          <TextField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<EmailIcon />}
            {...registerForm.register("email")}
            error={registerForm.formState.errors.email?.message}
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            icon={<LockIcon />}
            {...registerForm.register("password")}
            error={registerForm.formState.errors.password?.message}
          />

          <TextField
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            icon={<LockIcon />}
            {...registerForm.register("confirmPassword")}
            error={registerForm.formState.errors.confirmPassword?.message}
          />

          <AuthButton type="submit" disabled={isRegistering}>
            {isRegistering ? "Sending OTP..." : "Send verification code →"}
          </AuthButton>

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
            🔒 An OTP verification code will be sent to your email before saving your account.
          </p>
        </form>
      ) : (
        /* ─── Step 2: OTP Verification ─────────────────────────────────────── */
        <form
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
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
            <span>A 6-digit code has been sent to <strong>{userEmail}</strong>. Verify it to save and activate your account.</span>
          </div>

          <TextField
            label="6-Digit Verification Code (OTP)"
            type="text"
            placeholder="Enter 6-digit code"
            autoComplete="one-time-code"
            icon={<LockIcon />}
            {...otpForm.register("otp")}
            error={otpForm.formState.errors.otp?.message}
          />

          <AuthButton type="submit" disabled={isVerifying}>
            {isVerifying ? "Verifying & Saving..." : "Confirm & Save Account →"}
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
            ← Change registration information
          </button>
        </form>
      )}
    </AuthShell>
  );
}
