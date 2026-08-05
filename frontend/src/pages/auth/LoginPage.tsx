import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthButton,
  AuthDivider,
  AuthShell,
  GoogleButton,
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
      title="Welcome back"
      description="Sign in to continue your Japanese learning journey."
      footer={
        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-violet-400 hover:text-violet-300"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <GoogleButton type="button" onClick={handleGoogleSignIn}>
          Continue with Google
        </GoogleButton>

        <AuthDivider />

        <TextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <TextField
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500"
              {...register("rememberMe")}
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit">Sign in</AuthButton>

        <p className="text-center text-xs leading-5 text-slate-500">
          This is UI only. Authentication flow will be connected later.
        </p>
      </form>
    </AuthShell>
  );
}
