"use client";

import Link from "next/link";
import { Shield, ArrowRight, Mail, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  // After signup, go to signin which then goes to subscribe or next
  const callbackUrl = searchParams.get("callbackUrl") || next;

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Create account via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      // Auto sign in after registration
      posthog.capture("user_signed_up", { method: "email" });
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (signInRes?.error) { setError("Account created! Please sign in."); return; }
      window.location.href = callbackUrl;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] p-8 md:p-10 rounded-lg shadow-sm bg-[var(--surface)]/30">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[var(--gold)]/10 rounded-sm border border-[var(--accent)]">
          <Shield className="w-7 h-7 text-[var(--gold)]" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-[var(--muted)] text-sm mt-1 font-bold uppercase tracking-[0.14em]">Join the Network</p>
        </div>
      </div>

      {/* OAuth providers */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            posthog.capture("user_signed_up", { method: "google" });
            signIn("google", { callbackUrl });
          }}
          className="flex items-center justify-center gap-2 py-3 border border-[var(--border)] bg-[var(--elevated)] rounded-sm hover:border-[var(--accent)] text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <Mail className="w-4 h-4" /> Google
        </button>
        <button
          onClick={() => {
            posthog.capture("user_signed_up", { method: "github" });
            signIn("github", { callbackUrl });
          }}
          className="flex items-center justify-center gap-2 py-3 border border-[var(--border)] bg-[var(--elevated)] rounded-sm hover:border-[var(--accent)] text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <Github className="w-4 h-4" /> GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-[var(--border)] flex-1" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">or register with email</span>
        <div className="h-px bg-[var(--border)] flex-1" />
      </div>

      {error && <p className="text-[var(--danger)] text-sm mb-4 text-center">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-1.5">Full Name</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition-all"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-1.5">Email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition-all"
            placeholder="agent@globalchanakya.in"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-1.5">Password</label>
          <input
            type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition-all"
            placeholder="Min 8 characters"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-[var(--gold)] hover:bg-yellow-400 text-[var(--bg)] font-extrabold uppercase tracking-[0.06em] text-sm py-3.5 rounded-sm transition-colors mt-2 flex items-center justify-center gap-2 group disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted)] mt-6 font-medium">
        Already have an account?{" "}
        <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[var(--cyan)] hover:text-blue-300 transition-colors font-bold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
