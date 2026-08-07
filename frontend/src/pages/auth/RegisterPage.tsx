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
import { useRegister } from "../../hooks/useAuth";

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

export function RegisterPage() {
  const { mutate: registerUser, isPending, error } = useRegister();

  const serverError = error
    ? ((error as any).response?.data?.message ??
      (error as Error).message ??
      "Registration failed. Please try again.")
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerUser({
      username: values.name,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
  };

  return (
    <AuthShell
      title="Create your account ✨"
      description="Start your Japanese learning journey today — it's free!"
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      }
    >
      <form
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
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
            ⚠️ {serverError}
          </div>
        )}

        <TextField
          label="Full name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          icon={<UserIcon />}
          {...register("name")}
          error={errors.name?.message}
        />

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
          placeholder="Create a strong password"
          autoComplete="new-password"
          icon={<LockIcon />}
          {...register("password")}
          error={errors.password?.message}
        />

        <TextField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          icon={<LockIcon />}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <AuthButton type="submit" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account →"}
        </AuthButton>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
          🔒 Connected with Spring Boot backend API.
        </p>
      </form>
    </AuthShell>
  );
}
