"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export function LoginCard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("Counter Girl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onGoogleSignIn() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          position,
          outlet: "SM Davao",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email to confirm your account, then sign in.");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Kamay Kainan</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">SM Davao DTR System</h1>
      <p className="mt-2 text-sm text-slate-600">No Signature, No Pay. Sign in to continue.</p>

      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={loading}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        Sign in with Google
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
        <div className="h-px flex-1 bg-slate-200" />
        <span>or use email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-amber-200 focus:ring"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-amber-200 focus:ring"
              placeholder="Position"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              required
            />
          </>
        ) : null}

        <input
          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-amber-200 focus:ring"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-amber-200 focus:ring"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-amber-500 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60"
        >
          {mode === "signin" ? "Sign in with Email" : "Sign up with Email"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setMessage(null);
        }}
        className="mt-3 text-sm font-medium text-slate-700 underline underline-offset-4"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>

      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p> : null}
    </div>
  );
}
