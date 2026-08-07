import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthButton, AuthShell } from "../../components/ui/auth";
import { useVerifyEmail } from "../../hooks/useAuth";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { mutate: verifyToken, isPending, isSuccess, error } = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  return (
    <AuthShell
      title="Verify your email 📬"
      description="Check your inbox and follow the verification instructions to continue."
      footer={
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(148,163,184,0.85)" }}>
          Back to{" "}
          <Link to="/login" className="auth-link">
            sign in
          </Link>
        </p>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Email illustration / verification status */}
        <div
          style={{
            padding: "28px 20px",
            borderRadius: 18,
            background: "rgba(14,165,233,0.08)",
            border: "1px solid rgba(56,189,248,0.22)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 12, lineHeight: 1 }}>
            {isPending ? "⏳" : isSuccess ? "✅" : error ? "⚠️" : "✉️"}
          </div>
          <div style={{ fontSize: 14, color: "#7dd3fc", fontWeight: 600, marginBottom: 6 }}>
            {isPending
              ? "Verifying email..."
              : isSuccess
                ? "Email verified successfully!"
                : error
                  ? "Verification failed"
                  : "Verification email sent!"}
          </div>
          <div style={{ fontSize: 13, color: "rgba(148,163,184,0.85)", lineHeight: 1.7 }}>
            {isPending
              ? "Connecting with server to verify your email token..."
              : isSuccess
                ? "Your email has been confirmed. Redirecting to sign in..."
                : error
                  ? ((error as any)?.response?.data?.message ?? "Invalid or expired token.")
                  : "We've sent a confirmation email. Follow the steps below to complete registration."}
          </div>
        </div>

        {/* Steps */}
        {!token &&
          [
            { step: "1", text: "Open the email we sent you" },
            { step: "2", text: "Click the verification link" },
            { step: "3", text: "You're in! Start learning Japanese 🎌" },
          ].map(({ step, text }) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(56,189,248,0.12)",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: "0 0 12px rgba(14,165,233,0.4)",
                }}
              >
                {step}
              </span>
              <span style={{ fontSize: 13, color: "#bae6fd" }}>{text}</span>
            </div>
          ))}

        {!token && <AuthButton type="button">Resend verification email</AuthButton>}

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(100,116,139,0.8)" }}>
          🔒 Email verification connected with backend API.
        </p>
      </div>
    </AuthShell>
  );
}
