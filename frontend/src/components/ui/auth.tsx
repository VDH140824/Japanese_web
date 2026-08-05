import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

type FieldErrorProps = {
  message?: string;
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
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

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),_transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-[-7rem] right-[-4rem] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:grid-cols-2">
          <div className="hidden flex-col justify-between border-r border-white/10 bg-[linear-gradient(160deg,rgba(79,70,229,0.96),rgba(124,58,237,0.94),rgba(217,70,239,0.92))] p-8 md:flex lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
                Japanese Learning
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.28)] lg:text-5xl">
                Learn Japanese with a focused, beautiful experience.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/88 lg:text-base">
                Practice vocabulary, grammar, kanji, and quizzes with a modern
                study flow built for consistency.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/95 shadow-lg shadow-black/10 backdrop-blur-md">
              Responsive auth UI scaffold ready for routing, validation, and
              future backend integration.
            </div>
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%)]" />
            <div className="relative mx-auto max-w-md">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-violet-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
                  Secure access
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </div>

              {children}

              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TextField({
  label,
  error,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <input
        {...props}
        className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 ${
          error ? "border-rose-500 focus:border-rose-500" : "border-slate-700"
        } ${className}`}
      />
      {error ? <FieldError message={error} /> : null}
    </label>
  );
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-400">{message}</p>;
}

export function AuthButton({
  children,
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.45)] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}

export function GoogleButton({
  children,
  isLoading,
  className = "",
  disabled,
  ...props
}: GoogleButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white shadow-sm shadow-black/10">
        <svg viewBox="0 0 48 48" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303C33.654 32.659 29.325 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.967 3.038l5.657-5.657C34.956 6.053 29.715 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.967 3.038l5.657-5.657C34.956 6.053 29.715 4 24 4c-7.682 0-14.373 4.33-17.694 10.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.623 0 10.72-2.154 14.606-5.657l-6.735-5.382C29.803 34.411 27.028 36 24 36c-5.304 0-9.625-3.319-11.288-7.946l-6.52 5.025C9.466 39.556 16.227 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.432 5.961l.003-.002 6.735 5.382C37.129 36.989 40 31.058 40 24c0-1.341-.138-2.652-.389-3.917z"
          />
        </svg>
      </span>
      {isLoading ? "Loading..." : children}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-slate-700" />
      <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-500">
        or
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-700 to-slate-700" />
    </div>
  );
}
