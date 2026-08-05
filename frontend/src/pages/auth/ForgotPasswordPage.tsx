import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton, AuthShell, EmailIcon, TextField } from "../../components/ui/auth";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = () => {};

  return (
    <AuthShell
      title="Forgot password 🔑"
      description="Enter your email and we'll prepare a reset link for you."
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          Remembered your password?{" "}
          <Link to="/login" className="auth-link">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form style={{ display: "flex", flexDirection: "column", gap: 18 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Info banner */}
        <div style={{
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
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span>We'll send a password-reset link to your email address if it matches an account.</span>
        </div>

        <TextField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<EmailIcon />}
          {...register("email")}
          error={errors.email?.message}
        />

        <AuthButton type="submit">Send reset link →</AuthButton>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
          🔒 This is a static UI only. No backend request is triggered yet.
        </p>
      </form>
    </AuthShell>
  );
}
