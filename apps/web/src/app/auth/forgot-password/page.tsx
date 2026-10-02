"use client";

import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a success message or contact admin message
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-lg shadow-sm relative">
          <Link href="/auth/signin" className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex justify-center mb-6 mt-4">
            <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/30">
              <Mail className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
          
          {!submitted ? (
            <>
              <p className="text-gray-400 text-center text-sm mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                    placeholder="agent@globalchanakya.com"
                  />
                </div>
                
                <button type="submit" className="w-full bg-rose-600 text-white font-semibold py-3 rounded-sm hover:bg-rose-700 transition-colors mt-6">
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-400 font-medium">Reset request received!</p>
              <p className="text-sm text-gray-400">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive instructions to reset your password. 
                <br/><br/>
                <em>(Note: For security reasons during beta, please contact the admin directly to reset credentials).</em>
              </p>
              <Link href="/auth/signin" className="block w-full bg-white/10 text-white font-semibold py-3 rounded-sm hover:bg-white/20 transition-colors mt-6">
                Return to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
