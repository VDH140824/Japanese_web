import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthButton,
  AuthDivider,
  AuthShell,
  EmailIcon,
  GoogleButton,
  LockIcon,
  TextField,
} from "../../components/ui/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Minimum 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = () => {};
  const handleGoogleSignIn = () => {};

  return (
    <AuthShell
      title="Welcome back 👋"
      description="Sign in to continue your Japanese learning journey."
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </p>
      }
    >
      <form style={{ display: "flex", flexDirection: "column", gap: 18 }} onSubmit={handleSubmit(onSubmit)} noValidate>
        <GoogleButton type="button" onClick={handleGoogleSignIn}>
          Continue with Google
        </GoogleButton>

        <AuthDivider />

        <TextField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<EmailIcon />}
          {...register("email")}
          error={errors.email?.message}
        />

        <TextField
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={<LockIcon />}
          {...register("password")}
          error={errors.password?.message}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, color: "#94a3b8", cursor: "pointer" }}>
            <input
              type="checkbox"
              style={{ accentColor: "#0ea5e9", width: 15, height: 15, cursor: "pointer" }}
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="auth-link" style={{ fontSize: 13 }}>
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit">Sign in →</AuthButton>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)", marginTop: 4 }}>
          🔒 This is UI only. Authentication flow will be connected later.
        </p>
      </form>
    </AuthShell>
  );
}
