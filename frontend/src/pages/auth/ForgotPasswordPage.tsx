import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton, AuthShell, TextField } from "../../components/ui/auth";

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
      title="Forgot password"
      description="Enter your email address and we will prepare a reset link screen."
      footer={
        <p className="text-center text-sm text-slate-400">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-400 hover:text-violet-300"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <AuthButton type="submit">Send reset link</AuthButton>

        <p className="text-center text-xs leading-5 text-slate-500">
          This is a static UI only. No backend request is triggered yet.
        </p>
      </form>
    </AuthShell>
  );
}
