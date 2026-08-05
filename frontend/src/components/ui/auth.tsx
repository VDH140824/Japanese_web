import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { useState } from "react";

type FieldErrorProps = {
  message?: string;
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

type GoogleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

/* ─── SVG Icon helpers ─────────────────────────────────────────── */
export function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-sky-400">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}
export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-sky-400">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}
export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-sky-400">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  );
}
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a18.2 18.2 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ─── Floating animated particles ──────────────────────────────── */
function Particles() {
  const items = [
    { char: "日", x: "8%",  y: "18%", size: "text-3xl", delay: "0s",   dur: "8s" },
    { char: "本",  x: "88%", y: "12%", size: "text-2xl", delay: "1.5s", dur: "10s" },
    { char: "語",  x: "15%", y: "72%", size: "text-4xl", delay: "2.5s", dur: "9s"  },
    { char: "学",  x: "78%", y: "65%", size: "text-2xl", delay: "0.8s", dur: "11s" },
    { char: "習",  x: "50%", y: "8%",  size: "text-xl",  delay: "3.2s", dur: "7s"  },
    { char: "文",  x: "92%", y: "45%", size: "text-3xl", delay: "1.9s", dur: "12s" },
    { char: "字",  x: "3%",  y: "45%", size: "text-2xl", delay: "4s",   dur: "8.5s"},
    { char: "話",  x: "60%", y: "88%", size: "text-3xl", delay: "2s",   dur: "9.5s"},
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(({ char, x, y, size, delay, dur }, i) => (
        <span
          key={i}
          className={`absolute ${size} font-bold select-none`}
          style={{
            left: x, top: y,
            color: "rgba(125,211,252,0.18)",
            animationName: "floatKanji",
            animationDuration: dur,
            animationDelay: delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: i % 2 === 0 ? "normal" : "reverse",
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

/* ─── AuthShell ─────────────────────────────────────────────────── */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="auth-shell-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .auth-shell-root {
          font-family: 'Inter', sans-serif;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: linear-gradient(135deg, #020d1a 0%, #041628 30%, #061e38 60%, #031320 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        /* Animated background gradient blobs */
        .auth-blob-1 {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 65%);
          top: -180px; left: -120px;
          animation: blobPulse 8s ease-in-out infinite;
        }
        .auth-blob-2 {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.16) 0%, transparent 65%);
          bottom: -150px; right: -100px;
          animation: blobPulse 10s ease-in-out infinite reverse;
        }
        .auth-blob-3 {
          position: absolute;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%);
          top: 40%; left: 50%;
          transform: translateX(-50%);
          animation: blobPulse 12s ease-in-out infinite 2s;
        }
        /* Grid overlay */
        .auth-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        /* Kanji float animation */
        @keyframes floatKanji {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          33%       { transform: translateY(-20px) rotate(3deg); opacity: 1; }
          66%       { transform: translateY(10px) rotate(-3deg); opacity: 0.7; }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(14,165,233,0.3), 0 0 40px rgba(14,165,233,0.1); }
          50%       { box-shadow: 0 0 35px rgba(14,165,233,0.5), 0 0 70px rgba(14,165,233,0.2); }
        }

        /* Card */
        .auth-card {
          position: relative;
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(56,189,248,0.18);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 32px 80px rgba(0,0,0,0.55),
            0 0 80px rgba(14,165,233,0.1);
          animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
          backdrop-filter: blur(24px);
        }
        @media (max-width: 768px) {
          .auth-card { grid-template-columns: 1fr; }
          .auth-panel-left { display: none !important; }
        }

        /* Left decorative panel */
        .auth-panel-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          background: linear-gradient(160deg,
            rgba(7,89,133,0.98) 0%,
            rgba(14,116,144,0.97) 40%,
            rgba(6,182,212,0.95) 100%
          );
          position: relative;
          overflow: hidden;
        }
        .auth-panel-left::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .auth-panel-left::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -60px;
          width: 240px; height: 240px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }

        /* Right form panel */
        .auth-panel-right {
          position: relative;
          padding: 2.5rem;
          background: rgba(5,20,40,0.85);
          backdrop-filter: blur(24px);
        }
        .auth-panel-right::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at top center, rgba(14,165,233,0.08), transparent 55%);
          pointer-events: none;
        }

        /* Logo badge */
        .auth-logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 999px;
          padding: 6px 14px;
          backdrop-filter: blur(8px);
          margin-bottom: 1.5rem;
        }
        .auth-logo-badge .wave {
          font-size: 18px;
          animation: floatKanji 3s ease-in-out infinite;
          display: inline-block;
        }

        /* Secure badge */
        .auth-secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px 5px 5px;
          border-radius: 999px;
          background: rgba(14,165,233,0.12);
          border: 1px solid rgba(56,189,248,0.25);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #7dd3fc;
          margin-bottom: 1rem;
        }
        .auth-secure-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 10px rgba(52,211,153,0.8);
          animation: glowPulse 2s ease-in-out infinite;
        }

        /* Form title */
        .auth-form-title {
          font-size: 28px;
          font-weight: 700;
          color: #f0f9ff;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
          background: linear-gradient(135deg, #f0f9ff 30%, #7dd3fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Input field */
        .auth-input-wrap {
          position: relative;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px 13px 42px;
          border-radius: 14px;
          border: 1.5px solid rgba(56,189,248,0.2);
          background: rgba(255,255,255,0.04);
          color: #e0f2fe;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        }
        .auth-input::placeholder { color: rgba(148,163,184,0.6); }
        .auth-input:focus {
          border-color: #38bdf8;
          background: rgba(56,189,248,0.07);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.18), 0 0 20px rgba(14,165,233,0.12);
        }
        .auth-input.error {
          border-color: #f87171;
        }
        .auth-input.has-toggle { padding-right: 46px; }

        /* Eye toggle */
        .auth-eye-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(148,163,184,0.7);
          padding: 2px;
          transition: color 0.2s;
        }
        .auth-eye-btn:hover { color: #38bdf8; }

        /* Field label */
        .auth-field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #bae6fd;
          margin-bottom: 7px;
          letter-spacing: 0.01em;
        }

        /* Submit button */
        .auth-submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: 0.02em;
          color: white;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
          background-size: 200%;
          box-shadow: 0 8px 24px rgba(14,165,233,0.4), 0 2px 6px rgba(14,165,233,0.2);
          transition: transform 0.2s, box-shadow 0.2s, background-position 0.4s;
          animation: glowPulse 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          top: -50%; left: -60%;
          width: 40%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          animation: shimmer 3s linear infinite 1s;
        }
        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(14,165,233,0.5), 0 4px 10px rgba(14,165,233,0.3);
          background-position: right;
        }
        .auth-submit-btn:active { transform: translateY(0); }
        .auth-submit-btn:disabled {
          cursor: not-allowed; opacity: 0.55;
          transform: none; animation: none;
        }

        /* Google button */
        .auth-google-btn {
          width: 100%;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1.5px solid rgba(56,189,248,0.2);
          background: rgba(255,255,255,0.05);
          color: #e0f2fe;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.25s, background 0.25s, transform 0.2s, box-shadow 0.25s;
        }
        .auth-google-btn:hover {
          border-color: rgba(56,189,248,0.45);
          background: rgba(56,189,248,0.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(14,165,233,0.15);
        }
        .auth-google-btn:disabled { cursor: not-allowed; opacity: 0.55; }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 14px;
          margin: 1.5rem 0;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, rgba(56,189,248,0.3), transparent);
        }
        .auth-divider-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(148,163,184,0.7);
          padding: 4px 12px;
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 999px;
          background: rgba(255,255,255,0.03);
        }

        /* Testimonial card on left */
        .auth-testimonial {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          padding: 18px 20px;
          backdrop-filter: blur(8px);
          position: relative; z-index: 1;
        }

        /* Feature chips */
        .auth-features {
          display: flex; flex-direction: column; gap: 12px;
          position: relative; z-index: 1;
        }
        .auth-feature-chip {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(6px);
          transition: background 0.2s;
        }
        .auth-feature-chip:hover { background: rgba(255,255,255,0.15); }
        .auth-feature-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.18);
          display: grid; place-items: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        /* Link colors */
        .auth-link {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-link:hover { color: #7dd3fc; }

        /* Stats row */
        .auth-stats {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 8px; margin-top: 1.5rem;
          position: relative; z-index: 1;
        }
        .auth-stat {
          text-align: center;
          padding: 10px 8px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
        }
      `}</style>

      {/* Background effects */}
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />
      <div className="auth-blob-3" />
      <div className="auth-grid" />
      <Particles />

      {/* Main card */}
      <div className="auth-card">
        {/* Left panel */}
        <div className="auth-panel-left">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="auth-logo-badge">
              <span className="wave">🌊</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "white", letterSpacing: "0.05em" }}>
                日本語 Learning
              </span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "white", lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.5px" }}>
              Learn Japanese <br />
              <span style={{ color: "#bae6fd" }}>the beautiful way</span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, maxWidth: 290 }}>
              Practice vocabulary, kanji, grammar, and quizzes with a focused modern study flow.
            </p>
          </div>

          <div className="auth-features">
            {[
              { icon: "📖", label: "Vocabulary", desc: "Build word by word" },
              { icon: "🀄", label: "Kanji",      desc: "Master 2000+ characters" },
              { icon: "🎴", label: "Flashcards", desc: "Spaced repetition system" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="auth-feature-chip">
                <div className="auth-feature-icon">{icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="auth-stats">
              {[
                { val: "50K+", lbl: "Learners" },
                { val: "2000", lbl: "Kanji" },
                { val: "4.9★", lbl: "Rating" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="auth-stat">
                  <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div className="auth-testimonial" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", lineHeight: 1.6, fontStyle: "italic" }}>
                "This app made my JLPT N3 prep so much easier — beautiful and effective!"
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "grid", placeItems: "center", fontSize: 14 }}>😊</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>Nguyen Thi Lan</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>JLPT N3 Learner</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-panel-right">
          <div style={{ position: "relative", maxWidth: 380, margin: "0 auto" }}>
            {/* Secure badge */}
            <div className="auth-secure-badge">
              <span className="auth-secure-dot" />
              Secure access
            </div>

            {/* Title */}
            <h2 className="auth-form-title">{title}</h2>
            <p style={{ fontSize: 13, color: "rgba(148,163,184,0.9)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              {description}
            </p>

            {children}

            {footer ? <div style={{ marginTop: "1.5rem" }}>{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TextField ─────────────────────────────────────────────────── */
export function TextField({
  label,
  error,
  icon,
  className = "",
  type: typeProp,
  ...props
}: TextFieldProps) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = typeProp === "password";
  const resolvedType = isPassword ? (showPwd ? "text" : "password") : typeProp;

  return (
    <label className="block" style={{ marginBottom: 4 }}>
      <span className="auth-field-label">{label}</span>
      <div className="auth-input-wrap">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          {...props}
          type={resolvedType}
          className={`auth-input${error ? " error" : ""}${isPassword ? " has-toggle" : ""}${className}`}
          style={{ paddingLeft: icon ? 42 : 14 }}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShowPwd((v) => !v)}
            tabIndex={-1}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPwd} />
          </button>
        )}
      </div>
      {error ? <FieldError message={error} /> : null}
    </label>
  );
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p style={{ marginTop: 6, fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 13, height: 13, flexShrink: 0 }}>
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

/* ─── AuthButton ────────────────────────────────────────────────── */
export function AuthButton({ children, isLoading, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button {...props} disabled={disabled || isLoading} className={`auth-submit-btn ${className}`}>
      {isLoading ? (
        <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}

/* ─── GoogleButton ──────────────────────────────────────────────── */
export function GoogleButton({ children, isLoading, className = "", disabled, ...props }: GoogleButtonProps) {
  return (
    <button {...props} disabled={disabled || isLoading} className={`auth-google-btn ${className}`}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "white", display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
        <svg viewBox="0 0 48 48" aria-hidden="true" style={{ width: 14, height: 14 }}>
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.659 29.325 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.967 3.038l5.657-5.657C34.956 6.053 29.715 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.967 3.038l5.657-5.657C34.956 6.053 29.715 4 24 4c-7.682 0-14.373 4.33-17.694 10.691z" />
          <path fill="#4CAF50" d="M24 44c5.623 0 10.72-2.154 14.606-5.657l-6.735-5.382C29.803 34.411 27.028 36 24 36c-5.304 0-9.625-3.319-11.288-7.946l-6.52 5.025C9.466 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.432 5.961l.003-.002 6.735 5.382C37.129 36.989 40 31.058 40 24c0-1.341-.138-2.652-.389-3.917z" />
        </svg>
      </span>
      {isLoading ? "Loading..." : children}
    </button>
  );
}

/* ─── AuthDivider ───────────────────────────────────────────────── */
export function AuthDivider() {
  return (
    <div className="auth-divider">
      <span className="auth-divider-line" />
      <span className="auth-divider-text">or</span>
      <span className="auth-divider-line" />
    </div>
  );
}
