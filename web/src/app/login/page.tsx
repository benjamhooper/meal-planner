"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { useLogin, useRegister } from "@/hooks/useAuth";

type Mode = "oauth" | "login" | "register";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

function SocialButton({
  href,
  logo,
  label,
}: {
  href: string;
  logo: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-center gap-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
    >
      {logo}
      {label}
    </a>
  );
}

const GoogleLogo = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

const GitHubLogo = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
        <UtensilsCrossed size={32} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Family Meal Planner</h1>
      <p className="text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("oauth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const switchTo = (m: Mode) => {
    setMode(m);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginMutation.mutateAsync({ email, password });
      router.push("/meals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await registerMutation.mutateAsync({ name, email, password });
      router.push("/meals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  if (mode === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <Header subtitle="Sign in to plan meals together" />
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 active:scale-95 transition-transform disabled:opacity-60"
              >
                {loginMutation.isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
              <button onClick={() => switchTo("register")} className="text-green-600 hover:underline">
                Don&apos;t have an account? Register
              </button>
              <button onClick={() => switchTo("oauth")} className="text-gray-400 hover:underline">
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "register") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <Header subtitle="Create your account" />
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Min. 8 characters"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 active:scale-95 transition-transform disabled:opacity-60"
              >
                {registerMutation.isPending ? "Creating account…" : "Create account"}
              </button>
            </form>
            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
              <button onClick={() => switchTo("login")} className="text-green-600 hover:underline">
                Already have an account? Sign in
              </button>
              <button onClick={() => switchTo("oauth")} className="text-gray-400 hover:underline">
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Header subtitle="Sign in to plan meals together" />

        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-3">
          <SocialButton href={`${API_URL}/auth/google`} label="Continue with Google" logo={GoogleLogo} />
          <SocialButton href={`${API_URL}/auth/github`} label="Continue with GitHub" logo={GitHubLogo} />
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => switchTo("login")}
            className="flex items-center justify-center w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
          >
            Sign in with email
          </button>
        </div>
      </div>
    </div>
  );
}
