import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton, AuthShell, LockIcon, TextField } from "../../components/ui/auth";

const resetPasswordSchema = z
  .object({
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

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = () => {};

  return (
    <AuthShell
      title="Reset password 🛡️"
      description="Create a strong new password for your account."
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          <Link to="/login" className="auth-link">
            ← Back to sign in
          </Link>
        </p>
      }
    >
      <form style={{ display: "flex", flexDirection: "column", gap: 18 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Strength tip */}
        <div style={{
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
        }}>
          <span style={{ fontSize: 18 }}>🔐</span>
          <span>Use 8+ characters with a mix of letters, numbers and symbols for a strong password.</span>
        </div>

        <TextField
          label="New password"
          type="password"
          placeholder="Create a new password"
          autoComplete="new-password"
          icon={<LockIcon />}
          {...register("password")}
          error={errors.password?.message}
        />

        <TextField
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          icon={<LockIcon />}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <AuthButton type="submit">Update password →</AuthButton>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
          🔒 This is UI only and does not yet submit to any backend service.
        </p>
      </form>
    </AuthShell>
  );
}
