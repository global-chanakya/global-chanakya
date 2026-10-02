import { Globe, Users, Shield, Zap, Target, BookOpen, Award, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us — Global Chanakya Intelligence",
  description: "Learn about Global Chanakya Intelligence — our mission, editorial independence, founding story, global coverage model, analytical approach, and commitment to delivering unbiased geopolitical intelligence.",
};

export default function AboutPage() {
  return (
    <div className="py-28 md:py-36 bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <Globe className="w-4 h-4" /> About Us
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white max-w-3xl leading-[1.1]">
            Unvarnished Truth in a <br className="hidden md:block"/> Complex World.
          </h1>
          <p className="text-lg md:text-xl text-white opacity-85 leading-[1.8] font-medium max-w-2xl mx-auto">
            Global Chanakya is a strategic intelligence and geopolitical media platform designed for decision-makers, strategists, foreign policy enthusiasts, and anyone seeking to understand the forces shaping our world.
          </p>
        </div>

        {/* Mission & Independence Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-20 mb-20 text-left">
          <div className="p-8 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-1 transition-transform">
            <Zap className="w-8 h-8 text-[var(--gold)] mb-6" />
            <h3 className="font-heading text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-[var(--muted)] leading-relaxed text-sm">
              To provide predictive, accurate, and unbiased strategic analysis of global events. We cut through the noise of mainstream media to deliver pure intelligence — evidence-based, contextualised, and forward-looking analysis that empowers our readers to make informed decisions about the world.
            </p>
          </div>
          <div className="p-8 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-1 transition-transform">
            <Shield className="w-8 h-8 text-[var(--cyan)] mb-6" />
            <h3 className="font-heading text-xl font-bold text-white mb-3">Our Independence</h3>
            <p className="text-[var(--muted)] leading-relaxed text-sm">
              Global Chanakya operates as a fully independent platform. We take no government funding, corporate sponsorship, or partisan direction. Our analysis is driven solely by facts and strategic reasoning, ensuring our readers receive intelligence they can trust without hidden agendas or editorial compromise.
            </p>
          </div>
        </div>

        {/* Founding Story */}
        <div className="prose prose-invert prose-rose max-w-none text-left mb-20">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-white opacity-85 leading-[1.8] mb-6">
            Global Chanakya was founded in 2026 with a clear purpose: to fill the gap in accessible, non-partisan geopolitical intelligence. In an era where news cycles move at the speed of social media and strategic analysis is often locked behind expensive paywalls or filtered through ideological lenses, we saw a need for a platform that provides rigorous, independent analysis to anyone who wants to understand global power dynamics.
          </p>
          <p className="text-white opacity-85 leading-[1.8] mb-6">
            Named after Chanakya (Kautilya), the ancient Indian strategist and author of the Arthashastra — one of the world&apos;s earliest treatises on statecraft, economic policy, and military strategy — our platform embodies his legacy of strategic thinking, realism, and pragmatic analysis. Just as Chanakya provided counsel grounded in deep understanding of power dynamics, we aim to provide our readers with intelligence that is rooted in reality rather than wishful thinking.
          </p>
          <p className="text-white opacity-85 leading-[1.8]">
            Today, Global Chanakya serves a growing community of readers including government officials, military analysts, academic researchers, corporate strategists, students of international relations, and informed citizens across multiple continents who rely on our platform for clear-eyed analysis of the world&apos;s most consequential geopolitical developments.
          </p>
        </div>

        {/* What We Cover */}
        <div className="mb-20">
          <h2 className="font-heading text-2xl font-bold text-white mb-8">What We Cover</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-1 transition-transform">
              <Target className="w-6 h-6 text-[var(--gold)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Strategic Intelligence</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">In-depth analysis of great power competition, alliance systems, territorial disputes, and strategic flashpoints across every major region.</p>
            </div>
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-1 transition-transform">
              <Shield className="w-6 h-6 text-[var(--cyan)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Defence & Security</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Military capability assessments, defence procurement analysis, nuclear doctrine updates, and security sector developments worldwide.</p>
            </div>
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-1 transition-transform">
              <BookOpen className="w-6 h-6 text-[var(--gold)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Foreign Policy</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Diplomatic developments, bilateral and multilateral negotiations, treaty analysis, and shifts in foreign policy orientation among major and emerging powers.</p>
            </div>
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:-translate-y-1 transition-transform">
              <Globe className="w-6 h-6 text-[var(--cyan)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Economy & Trade</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">Geoeconomic analysis including trade wars, sanctions regimes, supply chain security, energy geopolitics, and the weaponisation of economic interdependence.</p>
            </div>
          </div>
        </div>

        {/* Global Coverage */}
        <div className="prose prose-invert prose-rose max-w-none text-left mb-20">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Global Coverage Model</h2>
          <p className="text-white opacity-85 leading-[1.8] mb-6">
            Our coverage spans every major geopolitical theatre, ensuring that our readers have a comprehensive view of global developments. We maintain dedicated coverage areas including:
          </p>
          <ul className="text-white opacity-85 leading-[1.8] list-disc pl-6 space-y-2">
            <li><strong className="text-white">Indo-Pacific:</strong> The defining strategic theatre of the 21st century, including AUKUS, the Quad, ASEAN dynamics, and great power competition in the Pacific.</li>
            <li><strong className="text-white">South Asia:</strong> Regional security dynamics, India-Pakistan relations, Afghanistan developments, and the strategic competition between India and China in the subcontinent.</li>
            <li><strong className="text-white">Middle East:</strong> Energy geopolitics, the Iran nuclear issue, Gulf security architecture, and the evolving dynamics of the Abraham Accords and broader regional realignment.</li>
            <li><strong className="text-white">Europe & NATO:</strong> Transatlantic relations, NATO expansion, European defence integration, and the impact of the Russia-Ukraine conflict on European security.</li>
            <li><strong className="text-white">China & Russia:</strong> Dedicated coverage of the two most consequential revisionist powers, including their domestic politics, military modernisation, economic strategies, and geopolitical manoeuvring.</li>
          </ul>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="font-heading text-2xl font-bold text-white mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
              <Award className="w-6 h-6 text-[var(--gold)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Accuracy Above All</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">We would rather be late and correct than first and wrong. Every claim is verified through our rigorous multi-source process before publication.</p>
            </div>
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
              <Users className="w-6 h-6 text-[var(--cyan)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Non-Partisan Analysis</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">We analyse all parties with equal rigour and do not align with any government, ideology, or geopolitical bloc. Our only allegiance is to the truth.</p>
            </div>
            <div className="p-6 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
              <Heart className="w-6 h-6 text-[var(--gold)] mb-4" />
              <h3 className="font-heading text-base font-bold text-white mb-2">Open Access</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">We believe geopolitical awareness should not be a privilege. All our flagship intelligence reports are freely accessible to our global community.</p>
            </div>
          </div>
        </div>

        {/* Who We Are */}
        <div className="prose prose-invert prose-rose max-w-none text-left mb-20">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Who We Are</h2>
          <p className="text-white opacity-85 leading-[1.8] mb-6">
            Our team comprises analysts, researchers, and editors with backgrounds spanning international relations, defence studies, diplomacy, economics, and journalism. Our contributors bring diverse regional expertise and language capabilities, ensuring that our analysis is informed by deep, contextual understanding of the regions we cover.
          </p>
          <p className="text-white opacity-85 leading-[1.8]">
            We operate as a distributed team with contributors and correspondents across multiple time zones, allowing us to provide timely analysis of developments in every major geopolitical theatre. Our editorial team is based in New Delhi, India, with virtual operations serving readers worldwide.
          </p>
        </div>

        {/* Related Links */}
        <div className="pt-12 border-t border-[var(--border)]">
          <h2 className="font-heading text-xl font-bold text-white mb-6">Learn More</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/editorial-policy" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
              <h3 className="font-heading font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Editorial Policy</h3>
              <p className="text-sm text-[var(--muted)]">Our standards & principles</p>
            </Link>
            <Link href="/methodology" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
              <h3 className="font-heading font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Methodology</h3>
              <p className="text-sm text-[var(--muted)]">How we research & analyse</p>
            </Link>
            <Link href="/contact" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
              <h3 className="font-heading font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Contact</h3>
              <p className="text-sm text-[var(--muted)]">Reach our editorial desk</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
