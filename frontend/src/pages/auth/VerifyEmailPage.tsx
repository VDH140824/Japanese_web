import { Link } from "react-router-dom";
import { AuthButton, AuthShell } from "../../components/ui/auth";

export function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your email"
      description="Check your inbox and follow the verification instructions to continue."
      footer={
        <p className="text-center text-sm text-slate-400">
          Back to{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-400 hover:text-violet-300"
          >
            sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm leading-6 text-slate-300">
          We have prepared a clean verification screen for the
          email-confirmation step. No backend logic is connected yet.
        </div>

        <AuthButton type="button">Resend verification email</AuthButton>

        <p className="text-center text-xs leading-5 text-slate-500">
          This page is UI-only and ready for future API integration.
        </p>
      </div>
    </AuthShell>
  );
}
