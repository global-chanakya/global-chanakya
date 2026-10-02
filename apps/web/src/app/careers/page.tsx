import { Briefcase, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Careers",
  description: "Join the Global Chanakya intelligence team.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Briefcase className="w-3.5 h-3.5" /> Join the Desk
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Careers at Global Chanakya
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-16">
          We are not currently hiring for full-time desk positions. However, we are always open to high-quality pitches from freelance geopolitical analysts, defense correspondents, and regional experts.
        </p>

        <div className="p-8 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-left">
          <h3 className="text-xl font-bold text-white mb-4">Pitch Guidelines</h3>
          <ul className="space-y-4 text-gray-400 text-sm mb-8">
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <p>Submissions must offer predictive analysis, not just a summary of recent news.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <p>Word count typically ranges between 1,200 and 2,500 words.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <p>Include your primary sources, strategic rationale, and your bio/credentials.</p>
            </li>
          </ul>
          <a href="/contact" className="inline-flex items-center gap-2 text-rose-400 font-medium hover:text-rose-300 transition-colors">
            Contact Editorial Desk <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
