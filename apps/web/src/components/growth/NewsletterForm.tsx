"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

interface NewsletterFormProps {
  type: "Daily Brief" | "Weekly Digest" | "Conflict Alert" | "Country Watch";
  entityName?: string;
}

export function NewsletterForm({ type, entityName }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simulate API call to DigestEngine
    setTimeout(() => {
      setStatus("success");
    }, 1000);
  };

  const title = entityName ? `${entityName} ${type}` : `Global Chanakya ${type}`;
  const description = type === "Conflict Alert" 
    ? "Get immediate intelligence briefings when the strategic situation escalates."
    : "Join 50,000+ diplomats, analysts, and strategists receiving our premium briefs.";

  if (status === "success") {
    return (
      <div className="p-6 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-emerald-400 mb-2">Intelligence Secured</h3>
        <p className="text-gray-300">You are now subscribed to the {title}. Watch your inbox.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-sm border border-gray-800 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-400" />
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-6 max-w-md">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="email" 
            required 
            placeholder="strategist@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <button 
            type="submit" 
            disabled={status === "loading"}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-sm transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? "Securing..." : "Subscribe"}
          </button>
        </form>
        <p className="text-[10px] text-gray-500 mt-3 text-center sm:text-left">
          By subscribing, you agree to our strictly confidential privacy policy. No spam. Ever.
        </p>
      </div>
    </div>
  );
}
