import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Search, AlertTriangle, RefreshCw, ShieldCheck, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fact-Checking Policy — Verification Standards',
  description: 'Global Chanakya Fact-Checking Policy details our multi-step verification process, source classification standards, error correction protocols, and commitment to accuracy in geopolitical reporting.',
};

export default function FactCheckingPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <CheckCircle className="w-4 h-4" /> Verification Standards
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white leading-[1.1]">
            Fact-Checking Policy
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-[1.8] font-medium max-w-3xl">
            In the era of information warfare and state-sponsored disinformation, rigorous fact-checking is not optional — it is mission-critical. Global Chanakya&apos;s fact-checking policy ensures that every claim, statistic, and analysis we publish has been verified through a structured, multi-step process.
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-16">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Search className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Our Five-Step Verification Process</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Every piece of information that enters our editorial pipeline is subjected to a rigorous five-step verification process before it can be published on Global Chanakya. This process is designed to filter out misinformation, propaganda, and unsubstantiated claims that are prevalent in the geopolitical information landscape.
              </p>

              <div className="space-y-6 mt-6">
                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Step 1: Initial Source Assessment</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    When a piece of information is first identified, the analyst evaluates the credibility and reliability of the original source. Is the source a government agency, a recognised news outlet, an academic institution, or an unverified social media account? This initial assessment determines the level of additional verification required. Information from Tier 1 sources (official government publications, international organisations) requires less additional verification than information from Tier 3 sources (social media, anonymous tips).
                  </p>
                </div>

                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Step 2: Cross-Reference & Corroboration</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    The analyst cross-references the information against at least two independent sources. For high-stakes geopolitical claims — such as military movements, diplomatic ruptures, or territorial disputes — a minimum of three independent sources is required. Sources must be genuinely independent (not simply republishing the same original report).
                  </p>
                </div>

                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Step 3: Contextual Verification</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    The information is evaluated within its broader geopolitical context. Does the claim align with known facts and established patterns? Is there a plausible strategic rationale for the claimed event? Are there any known disinformation campaigns currently targeting this issue? This step helps identify sophisticated disinformation that may pass basic source checks.
                  </p>
                </div>

                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Step 4: Expert Consultation</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    For specialised claims (e.g., military capabilities, nuclear doctrine, economic sanctions), we consult with subject-matter experts — either from within our analyst network or from recognised external institutions. This ensures that technical claims are evaluated by individuals with the relevant domain expertise.
                  </p>
                </div>

                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Step 5: Editorial Board Review</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    Before publication, the senior editorial board conducts a final review of the fact-checked content. This review ensures that the verification process has been properly followed and that all claims are adequately supported. The board has the authority to hold or reject content that does not meet our verification standards.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. Source Classification System</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                We classify sources into four tiers based on their reliability, institutional backing, and track record of accuracy. This classification system guides our verification requirements and helps our readers understand the confidence level of our reporting:
              </p>
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 text-white font-bold">Tier</th>
                      <th className="text-left py-3 px-4 text-white font-bold">Source Type</th>
                      <th className="text-left py-3 px-4 text-white font-bold">Examples</th>
                      <th className="text-left py-3 px-4 text-white font-bold">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    <tr className="border-b border-[var(--border)]/50">
                      <td className="py-3 px-4 font-bold text-emerald-400">Tier 1</td>
                      <td className="py-3 px-4">Official / Institutional</td>
                      <td className="py-3 px-4">Government publications, UN resolutions, treaty texts</td>
                      <td className="py-3 px-4">1+ corroboration</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]/50">
                      <td className="py-3 px-4 font-bold text-blue-400">Tier 2</td>
                      <td className="py-3 px-4">Established Media / Academic</td>
                      <td className="py-3 px-4">Reuters, AP, peer-reviewed journals, think tanks</td>
                      <td className="py-3 px-4">2+ corroborations</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]/50">
                      <td className="py-3 px-4 font-bold text-yellow-400">Tier 3</td>
                      <td className="py-3 px-4">Regional Media / OSINT</td>
                      <td className="py-3 px-4">Regional outlets, verified OSINT, expert blogs</td>
                      <td className="py-3 px-4">3+ corroborations</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-red-400">Tier 4</td>
                      <td className="py-3 px-4">Unverified / Social Media</td>
                      <td className="py-3 px-4">Social media posts, anonymous sources, rumours</td>
                      <td className="py-3 px-4">Not published unless elevated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Identifying & Countering Disinformation</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                The geopolitical landscape is rife with state-sponsored disinformation, propaganda, and influence operations. Our fact-checking process includes specific measures to identify and counter these threats:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Known Disinformation Vectors:</strong> We maintain an internal database of known disinformation campaigns, state-sponsored media outlets with documented patterns of misinformation, and common narrative manipulation techniques used by various actors.</li>
                <li><strong className="text-white">Narrative Analysis:</strong> We analyse the narrative framing of information to identify potential propaganda patterns — such as selective fact presentation, emotional manipulation, and false equivalence.</li>
                <li><strong className="text-white">Provenance Tracking:</strong> For significant claims, we trace the information back to its original source to identify if it originated from a known disinformation actor before being laundered through seemingly credible intermediary outlets.</li>
                <li><strong className="text-white">Red Team Analysis:</strong> For high-stakes reports, we employ a &quot;red team&quot; approach where a separate analyst actively attempts to disprove the claims in the report, strengthening the overall analysis.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">4. Error Correction Protocol</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Despite our rigorous verification process, errors can occur. We are committed to prompt, transparent, and thorough corrections whenever inaccuracies are identified:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Immediate Action:</strong> When a factual error is identified (by our team, readers, or external parties), we take immediate steps to verify the nature and extent of the error.</li>
                <li><strong className="text-white">Transparent Corrections:</strong> Corrections are clearly labelled and timestamped. For minor errors, a correction note is appended to the article. For significant errors that affect the analysis, a prominent correction notice is placed at the top of the article.</li>
                <li><strong className="text-white">Root Cause Analysis:</strong> We investigate how the error occurred and what steps can be taken to prevent similar errors in the future. This may involve updating our verification procedures, adding new source checks, or providing additional training to our analysts.</li>
                <li><strong className="text-white">Reader Notification:</strong> For major corrections, we proactively notify readers who may have been affected by the inaccurate information through update notices on the article.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">5. Reader Contributions to Fact-Checking</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                We recognise that our readers — many of whom are specialists, analysts, and practitioners in geopolitical fields — are valuable partners in our fact-checking efforts. We welcome and actively encourage reader input:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>If you identify a factual error or inaccuracy in any Global Chanakya publication, please contact us at <strong>editorglobalchanakya.com@gmail.com</strong> with the subject line &quot;Fact-Check Report&quot;.</li>
                <li>Please include specific details about the claimed error, including the article URL, the specific claim in question, and the evidence or sources that contradict it.</li>
                <li>All reader fact-check reports are reviewed by our editorial team within 48 hours.</li>
                <li>We will respond to all reports, either confirming a correction has been made or explaining why the original content remains accurate based on our verification.</li>
              </ul>
              <p>
                Your contributions help us maintain the highest standards of accuracy and strengthen the overall quality of geopolitical intelligence available to our community.
              </p>
            </div>
          </section>

          {/* Related Links */}
          <section className="pt-12 border-t border-[var(--border)]">
            <h2 className="text-xl font-bold text-white mb-6">Related Policies</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/editorial-policy" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Editorial Policy</h3>
                <p className="text-sm text-[var(--muted)]">Our editorial standards & principles</p>
              </Link>
              <Link href="/source-verification" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Source Verification</h3>
                <p className="text-sm text-[var(--muted)]">Source hierarchy & reliability criteria</p>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
