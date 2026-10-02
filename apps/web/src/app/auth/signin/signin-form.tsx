"use client";

import Link from "next/link";
import { Lock, Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        setError("Invalid credentials");
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-lg shadow-sm bg-[var(--surface)]/30">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-[var(--gold)]/10 rounded-full border border-[var(--accent)]">
          <Lock className="w-6 h-6 text-[var(--gold)]" />
        </div>
      </div>
      <h2 className="font-heading text-2xl font-bold text-center mb-2 text-white">Access Intelligence</h2>
      <p className="text-[var(--muted)] text-center text-sm mb-8">Sign in to your Global Chanakya account.</p>

      {error && <p className="text-[var(--danger)] text-sm text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition-all"
            placeholder="agent@globalchanakya.in"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.14em] mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] focus:border-[var(--cyan)] transition-all"
            placeholder="••••••••"
          />
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <label className="flex items-center gap-2 text-[var(--muted)]">
            <input type="checkbox" className="rounded bg-[var(--bg)] border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]/50" />
            Remember me
          </label>
          <Link href="/auth/forgot-password" className="text-[var(--gold)] hover:text-yellow-200 transition-colors">Forgot password?</Link>
        </div>

        <button type="submit" className="w-full bg-[var(--gold)] text-[var(--bg)] text-sm font-extrabold uppercase tracking-[0.06em] py-3.5 rounded-sm hover:bg-yellow-400 transition-colors mt-6">
          Sign In
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="h-px bg-[var(--border)] flex-1"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Or continue with</span>
        <div className="h-px bg-[var(--border)] flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button onClick={() => signIn("google", { callbackUrl })} className="flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] bg-[var(--elevated)] rounded-sm hover:border-[var(--accent)] text-white transition-colors text-sm font-bold uppercase tracking-widest">
          <Mail className="w-4 h-4" /> Google
        </button>
        <button onClick={() => signIn("github", { callbackUrl })} className="flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] bg-[var(--elevated)] rounded-sm hover:border-[var(--accent)] text-white transition-colors text-sm font-bold uppercase tracking-widest">
          <Github className="w-4 h-4" /> GitHub
        </button>
      </div>

      <p className="text-center text-sm text-[var(--muted)] mt-8">
        Need access? <Link href="/auth/signup" className="text-[var(--cyan)] hover:text-blue-300 font-bold transition-colors">Apply for an account</Link>
      </p>
    </div>
  );
}
