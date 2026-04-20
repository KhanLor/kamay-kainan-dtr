"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function onGoogleSignIn() {
    if (!supabase) {
      setMessage("Missing Supabase env configuration. Check .env.local.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await fetch("/api/session/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rememberMe }),
    });
  }

  async function onEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Missing Supabase env configuration. Check .env.local.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await fetch("/api/session/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rememberMe }),
    });

    router.push("/dashboard");
    router.refresh();
  }

  async function onEmailSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Missing Supabase env configuration. Check .env.local.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your inbox and verify your email before signing in.");
    setLoading(false);
  }

  async function onResetPassword() {
    if (!supabase) {
      setMessage("Missing Supabase env configuration. Check .env.local.");
      return;
    }

    const email = window.prompt("Enter your account email for password reset:");
    if (!email) {
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setMessage(error ? error.message : "Password reset link sent.");
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-[#2f2318]">Sign in to Kamay Kainan DTR</h1>
      <p className="mt-2 text-sm text-[#665646]">
        No Signature, No Pay policy is enforced for every record.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={loading}
          className="rounded-xl bg-[#2f6d62] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24554d] disabled:opacity-60"
        >
          Sign in with Google
        </button>
      </div>

      <div className="my-6 h-px bg-line" />

      <form className="flex flex-col gap-3" onSubmit={onEmailSignIn}>
        <input
          type="email"
          name="email"
          required
          placeholder="Email address"
          className="h-11 rounded-xl border border-line px-3 text-sm"
        />
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="Password"
          className="h-11 rounded-xl border border-line px-3 text-sm"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#55463b]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me (7 days)
          </label>
          <button
            type="button"
            onClick={onResetPassword}
            className="font-semibold text-[#2f6d62] hover:underline"
          >
            Reset password
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#3f372f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c261f] disabled:opacity-60"
        >
          Sign in with Email
        </button>
      </form>

      <form className="mt-3" onSubmit={onEmailSignUp}>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl border border-line bg-[#fff8ee] px-4 py-3 text-sm font-semibold text-[#3f372f] transition hover:bg-[#fbeccf] disabled:opacity-60"
        >
          Sign up with Email
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-[#7a3028]">{message}</p> : null}
    </div>
  );
}
