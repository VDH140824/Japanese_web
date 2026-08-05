import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthButton,
  AuthDivider,
  AuthShell,
  TextField,
} from "../../components/ui/auth";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "Minimum 2 characters"),
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

  const onSubmit = () => {};

  return (
    <AuthShell
      title="Create your account"
      description="Start your Japanese learning journey with a simple, responsive registration screen."
      footer={
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-400 hover:text-violet-300"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Full name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          {...register("name")}
          error={errors.name?.message}
        />

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
          placeholder="Create a password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />

        <TextField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <AuthButton type="submit">Create account</AuthButton>

        <AuthDivider />

        <p className="text-center text-xs leading-5 text-slate-500">
          This screen is UI-only and ready for backend wiring later.
        </p>
      </form>
    </AuthShell>
  );
}
