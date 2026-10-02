"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Loader2, TrendingUp } from "lucide-react";

interface Issue {
  type: "error" | "warn" | "pass";
  msg: string;
  fix?: string; // what the optimizer will fix
}

interface Props {
  formData: any;
  onOptimized?: (optimized: any) => void; // callback to merge optimized fields into formData
}

export default function SEOScoringWidget({ formData, onOptimized }: Props) {
  const [score, setScore] = useState(100);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [justOptimized, setJustOptimized] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const newIssues: Issue[] = [];
    let curScore = 100;

    const title = formData?.seo?.title || formData?.title || "";
    const desc = formData?.seo?.description || "";
    const content = formData?.content || formData?.summary || formData?.overview || "";
    const aiSummary = formData?.aiSummary || "";
    const keywords = formData?.seo?.keywords || [];
    const focusKeyword = formData?.seo?.focusKeyword || "";
    const featuredImage = formData?.featuredImage || formData?.imageUrl || "";
    const ogImage = formData?.ogImage || "";
    const slug = formData?.slug || "";
    const canonicalUrl = formData?.seo?.canonicalUrl || "";
    const robots = formData?.seo?.robots || "";

    // ── Title ──────────────────────────────────────────
    if (!title) {
      newIssues.push({ type: "error", msg: "Missing SEO title", fix: "seo.title" });
      curScore -= 20;
    } else if (title.length < 30) {
      newIssues.push({ type: "warn", msg: `Title too short: ${title.length} chars (need 30+)`, fix: "seo.title" });
      curScore -= 8;
    } else if (title.length > 60) {
      newIssues.push({ type: "warn", msg: `Title too long: ${title.length} chars (max 60)`, fix: "seo.title" });
      curScore -= 5;
    } else {
      newIssues.push({ type: "pass", msg: `Title: ${title.length} chars ✓` });
    }

    // ── Description ────────────────────────────────────
    if (!desc) {
      newIssues.push({ type: "error", msg: "Missing meta description", fix: "seo.description" });
      curScore -= 20;
    } else if (desc.length < 120) {
      newIssues.push({ type: "warn", msg: `Description short: ${desc.length} chars (need 120+)`, fix: "seo.description" });
      curScore -= 8;
    } else if (desc.length > 160) {
      newIssues.push({ type: "warn", msg: `Description long: ${desc.length} chars (max 160)`, fix: "seo.description" });
      curScore -= 5;
    } else {
      newIssues.push({ type: "pass", msg: `Description: ${desc.length} chars ✓` });
    }

    // ── Content ────────────────────────────────────────
    const plainContent = content.replace(/<[^>]+>/g, "").trim();
    if (!plainContent || plainContent.length < 300) {
      newIssues.push({ type: "error", msg: `Content thin: ${plainContent.length} chars (need 300+)` });
      curScore -= 15;
    } else {
      newIssues.push({ type: "pass", msg: `Content: ${plainContent.length} chars ✓` });
    }

    // ── Focus Keyword ──────────────────────────────────
    if (!focusKeyword) {
      newIssues.push({ type: "warn", msg: "No focus keyword set", fix: "seo.focusKeyword" });
      curScore -= 5;
    } else {
      const fkLower = focusKeyword.toLowerCase();
      const titleHasFK = title.toLowerCase().includes(fkLower);
      const descHasFK = desc.toLowerCase().includes(fkLower);
      const slugHasFK = slug.toLowerCase().includes(fkLower.replace(/\\s+/g, "-"));

      if (titleHasFK) {
        newIssues.push({ type: "pass", msg: "Focus keyword in title ✓" });
      } else {
        newIssues.push({ type: "warn", msg: "Focus keyword missing from title" });
        curScore -= 5;
      }
      if (descHasFK) {
        newIssues.push({ type: "pass", msg: "Focus keyword in description ✓" });
      } else {
        newIssues.push({ type: "warn", msg: "Focus keyword missing from description" });
        curScore -= 3;
      }
      if (slugHasFK) {
        newIssues.push({ type: "pass", msg: "Focus keyword in URL ✓" });
      } else {
        newIssues.push({ type: "warn", msg: "Focus keyword not in URL slug" });
        curScore -= 2;
      }
    }

    // ── AI Summary ─────────────────────────────────────
    if (!aiSummary) {
      newIssues.push({ type: "warn", msg: "Missing AI Summary (llms.txt)", fix: "aiSummary" });
      curScore -= 5;
    } else if (aiSummary.length < 100) {
      newIssues.push({ type: "warn", msg: `AI Summary too short: ${aiSummary.length} chars` });
      curScore -= 3;
    } else {
      newIssues.push({ type: "pass", msg: "AI Summary present ✓" });
    }

    // ── Keywords ───────────────────────────────────────
    if (!keywords || keywords.length === 0) {
      newIssues.push({ type: "warn", msg: "No keywords set", fix: "seo.keywords" });
      curScore -= 5;
    } else if (keywords.length < 3) {
      newIssues.push({ type: "warn", msg: `Only ${keywords.length} keywords (3+ recommended)` });
      curScore -= 2;
    } else {
      newIssues.push({ type: "pass", msg: `${keywords.length} keywords ✓` });
    }

    // ── Featured Image ─────────────────────────────────
    if (!featuredImage) {
      newIssues.push({ type: "warn", msg: "No featured image" });
      curScore -= 3;
    } else {
      newIssues.push({ type: "pass", msg: "Featured image set ✓" });
    }

    // ── OG Image ───────────────────────────────────────
    if (!ogImage && !featuredImage) {
      newIssues.push({ type: "warn", msg: "No OG image for social sharing" });
      curScore -= 3;
    } else {
      newIssues.push({ type: "pass", msg: "Social image set ✓" });
    }

    // ── Slug ───────────────────────────────────────────
    if (!slug) {
      newIssues.push({ type: "error", msg: "Missing slug", fix: "slug" });
      curScore -= 10;
    } else if (slug.length > 75) {
      newIssues.push({ type: "warn", msg: `URL slug too long: ${slug.length} chars` });
      curScore -= 3;
    } else {
      newIssues.push({ type: "pass", msg: "URL slug set ✓" });
    }

    // ── Canonical URL ──────────────────────────────────
    if (canonicalUrl && !canonicalUrl.startsWith("http")) {
      newIssues.push({ type: "error", msg: "Invalid canonical URL format" });
      curScore -= 5;
    }

    // ── Robots Directive ───────────────────────────────
    if (robots && robots.includes("noindex")) {
      newIssues.push({ type: "warn", msg: "Page set to noindex — won't appear in search" });
    }

    // ── Readability — basic sentence length analysis ───
    if (plainContent.length > 300) {
      const sentences = plainContent.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
      const avgSentenceLen = sentences.reduce((sum: number, s: string) => sum + s.trim().split(/\\s+/).length, 0) / (sentences.length || 1);
      if (avgSentenceLen > 25) {
        newIssues.push({ type: "warn", msg: `Avg sentence: ${Math.round(avgSentenceLen)} words (aim for <25)` });
        curScore -= 3;
      } else {
        newIssues.push({ type: "pass", msg: `Readability: ${Math.round(avgSentenceLen)} words/sentence ✓` });
      }
    }

    setScore(Math.max(0, Math.min(100, curScore)));
    setIssues(newIssues);
  }, [formData]);

  const handleAutoOptimize = async () => {
    if (!onOptimized || isOptimizing) return;
    setIsOptimizing(true);
    setJustOptimized(false);
    try {
      const res = await fetch("/api/admin/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      let errorMsg = "Optimization failed";
      if (!res.ok) {
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      
      const { optimized } = await res.json();
      onOptimized(optimized);
      setJustOptimized(true);
      setTimeout(() => setJustOptimized(false), 4000);
    } catch (err: any) {
      alert("Auto-optimize failed: " + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const scoreColor =
    score >= 90 ? "text-green-400" :
    score >= 70 ? "text-[var(--gold)]" :
    score >= 50 ? "text-orange-400" :
    "text-red-500";

  const scoreBg =
    score >= 90 ? "bg-green-500/10 border-green-500/20" :
    score >= 70 ? "bg-[var(--gold)]/10 border-[var(--accent)]" :
    score >= 50 ? "bg-orange-500/10 border-orange-500/20" :
    "bg-red-500/10 border-red-500/20";

  const scoreLabel =
    score >= 90 ? "Excellent" :
    score >= 70 ? "Good" :
    score >= 50 ? "Needs Work" :
    "Poor";

  const needsOptimize = score < 90;
  const fixableIssues = issues.filter((i) => i.fix && i.type !== "pass");
  const errors = issues.filter(i => i.type === "error");
  const warnings = issues.filter(i => i.type === "warn");
  const passed = issues.filter(i => i.type === "pass");

  return (
    <div className="rounded-sm border border-[var(--border)] overflow-hidden">
      {/* Score Header */}
      <div className={`p-4 border-b border-[var(--border)] ${scoreBg}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">SEO Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black tabular-nums ${scoreColor}`}>{score}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${scoreBg} ${scoreColor}`}>
              {scoreLabel}
            </span>
          </div>
        </div>

        {/* Score Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 90 ? "bg-green-400" : score >= 70 ? "bg-[var(--gold)]" : score >= 50 ? "bg-orange-400" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Quick Summary */}
        <div className="flex items-center gap-3 mt-2.5 text-[10px]">
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <XCircle className="w-3 h-3" /> {errors.length} errors
            </span>
          )}
          {warnings.length > 0 && (
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <AlertTriangle className="w-3 h-3" /> {warnings.length} warnings
            </span>
          )}
          {passed.length > 0 && (
            <span className="flex items-center gap-1 text-green-500/70 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> {passed.length} passed
            </span>
          )}
        </div>
      </div>

      {/* Toggle Issues List */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white flex items-center justify-center gap-1 transition-colors"
      >
        {expanded ? "Hide Details" : "Show Details"}
        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Issues List — collapsible */}
      {expanded && (
        <div className="px-3 pb-2 space-y-1.5 max-h-56 overflow-y-auto border-t border-[var(--border)] pt-2">
          {/* Errors first */}
          {errors.map((issue, idx) => (
            <div key={`e${idx}`} className="flex items-start gap-2 text-xs">
              <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <span className="text-red-400">{issue.msg}</span>
            </div>
          ))}
          {/* Warnings */}
          {warnings.map((issue, idx) => (
            <div key={`w${idx}`} className="flex items-start gap-2 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
              <span className="text-[var(--muted)]">{issue.msg}</span>
            </div>
          ))}
          {/* Passed */}
          {passed.map((issue, idx) => (
            <div key={`p${idx}`} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-green-500/70">{issue.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Auto-Optimize Button — only shows when score < 90 */}
      {needsOptimize && onOptimized && (
        <div className="p-3 pt-0">
          <button
            onClick={handleAutoOptimize}
            disabled={isOptimizing}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
              font-bold text-xs uppercase tracking-wider transition-all duration-200
              ${justOptimized
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : isOptimizing
                ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--accent)] cursor-wait"
                : "bg-[var(--gold)] text-black hover:bg-yellow-400  hover:"
              }
            `}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Optimizing...
              </>
            ) : justOptimized ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Optimized!
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fix SEO ({fixableIssues.length} issues)
              </>
            )}
          </button>
          {!isOptimizing && !justOptimized && fixableIssues.length > 0 && (
            <p className="text-[9px] text-[var(--muted)] text-center mt-1.5 leading-tight">
              Will fix: {fixableIssues.map(i => i.fix).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Perfect score state */}
      {!needsOptimize && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-xs text-green-400 font-bold">SEO is fully optimized!</span>
          </div>
        </div>
      )}
    </div>
  );
}
