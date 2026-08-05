import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthButton, AuthShell, TextField } from "../../components/ui/auth";

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
      title="Reset password"
      description="Create a new password for your account."
      footer={
        <p className="text-center text-sm text-slate-400">
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
          label="New password"
          type="password"
          placeholder="Create a new password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />

        <TextField
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <AuthButton type="submit">Update password</AuthButton>

        <p className="text-center text-xs leading-5 text-slate-500">
          This is UI only and does not yet submit to any backend service.
        </p>
      </form>
    </AuthShell>
  );
}
