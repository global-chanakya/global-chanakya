import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Database, Eye, Lock, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Source Verification Policy — Intelligence Reliability',
  description: 'Global Chanakya Source Verification Policy details our source hierarchy, reliability assessment criteria, OSINT standards, and source confidentiality protocols for geopolitical intelligence.',
};

export default function SourceVerificationPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4" /> Intelligence Standards
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white leading-[1.1]">
            Source Verification
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-[1.8] font-medium max-w-3xl">
            The quality of geopolitical intelligence depends fundamentally on the quality and reliability of its sources. Global Chanakya maintains a structured source verification framework that classifies, evaluates, and monitors the sources used across all our reporting and analysis.
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-16">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Source Hierarchy</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Global Chanakya relies on a structured hierarchy of sources to build our strategic intelligence reports. This hierarchy is designed to ensure that our analysis is grounded in the most reliable and authoritative information available:
              </p>

              <h3 className="text-lg font-bold text-white mt-6">Primary Sources</h3>
              <p>
                Primary sources form the bedrock of our intelligence reporting. These are first-hand, original sources that provide direct evidence of events, policies, or decisions. Our primary sources include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Official government statements, press releases, and policy documents issued by foreign ministries, defence departments, and heads of state</li>
                <li>Declassified intelligence documents and diplomatic cables released through official channels</li>
                <li>Treaty texts, international agreements, United Nations Security Council resolutions, and multilateral communiqués</li>
                <li>Official military doctrine publications, defence white papers, and national security strategy documents</li>
                <li>Direct interviews with government officials, diplomats, military officers, and subject-matter experts conducted by our editorial team</li>
                <li>Parliamentary proceedings, legislative records, and official committee hearing transcripts</li>
              </ul>

              <h3 className="text-lg font-bold text-white mt-6">Secondary Sources</h3>
              <p>
                Secondary sources provide informed analysis, interpretation, and contextualisation of primary source material. We rely on:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Peer-reviewed academic journals specialising in international relations, security studies, and strategic affairs</li>
                <li>Research papers and policy briefs from reputable think tanks including RAND Corporation, Brookings Institution, Carnegie Endowment for International Peace, Chatham House, Observer Research Foundation, and the International Institute for Strategic Studies (IISS)</li>
                <li>Official reports from international organisations such as the World Bank, IMF, WTO, SIPRI, and the International Atomic Energy Agency (IAEA)</li>
                <li>Authoritative reference works including the Military Balance (IISS), SIPRI Yearbook, and World Factbook</li>
              </ul>

              <h3 className="text-lg font-bold text-white mt-6">Tertiary Sources</h3>
              <p>
                Tertiary sources provide supplementary context and additional perspectives. While less authoritative than primary and secondary sources, they are valuable for situational awareness and identifying emerging trends:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>High-reputation international news agencies (Reuters, Associated Press, Agence France-Presse)</li>
                <li>Established national and regional news outlets with demonstrated editorial standards</li>
                <li>Historical archives and databases maintained by academic institutions and national libraries</li>
                <li>Verified OSINT (Open Source Intelligence) from established analysts and research groups</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Database className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. OSINT Standards & Practices</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Open Source Intelligence (OSINT) is a critical component of modern geopolitical analysis. We employ OSINT methodologies to supplement our traditional source base, particularly for monitoring real-time developments, tracking military movements, and identifying emerging geopolitical trends. Our OSINT practices adhere to the following standards:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Verified OSINT Only:</strong> We do not publish OSINT-derived claims unless they have been verified through our standard multi-source verification process. Raw OSINT data from social media, satellite imagery forums, or flight tracking platforms is treated as an initial indicator that requires corroboration.</li>
                <li><strong className="text-white">Analyst Attribution:</strong> When OSINT is used, we credit the OSINT researcher or organisation that first identified the data point, maintaining transparency about the provenance of our information.</li>
                <li><strong className="text-white">Ethical OSINT:</strong> We adhere to ethical OSINT practices, ensuring that our intelligence gathering does not involve hacking, social engineering, or accessing restricted systems. All information is gathered from genuinely public and legally accessible sources.</li>
                <li><strong className="text-white">Limitations Disclosure:</strong> We clearly state when an analysis relies significantly on OSINT data and acknowledge the inherent limitations of open-source information, including the possibility of deliberate deception operations targeting OSINT analysts.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Eye className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Source Reliability Assessment</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Each source used in our reporting is assessed against a comprehensive reliability matrix. This assessment considers multiple factors to determine the confidence level we assign to information from that source:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Track Record:</strong> Has the source been consistently accurate in the past? Sources with documented histories of inaccurate reporting are flagged and require additional verification.</li>
                <li><strong className="text-white">Institutional Backing:</strong> Is the source backed by a credible institution (government, university, established media organisation)? Institutional backing generally increases reliability, though we remain aware that institutional sources can also be used for propaganda or disinformation.</li>
                <li><strong className="text-white">Potential Bias:</strong> What potential biases might the source have? This includes national bias, political bias, commercial interests, and organisational affiliations. We evaluate how these biases might affect the information being provided.</li>
                <li><strong className="text-white">Proximity to Event:</strong> How close is the source to the event being reported? Direct witnesses and participants generally provide more reliable information than sources reporting second-hand or third-hand accounts.</li>
                <li><strong className="text-white">Corroboration Level:</strong> Can the information from this source be independently corroborated? Information that can be verified through multiple independent channels receives a higher reliability rating.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">4. Source Confidentiality</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                In certain situations, our sources may require confidentiality to protect their safety, professional standing, or access to information. We handle source confidentiality with the utmost seriousness:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Minimised Use:</strong> We minimise the use of anonymous or confidential sources. When possible, we prefer to attribute information to named, on-the-record sources for maximum transparency.</li>
                <li><strong className="text-white">Justification:</strong> When confidential sources are used, we provide context about the source&apos;s position and credibility without revealing identifying details. Readers are informed about why the source required confidentiality.</li>
                <li><strong className="text-white">Enhanced Verification:</strong> Information from confidential sources undergoes enhanced verification, requiring corroboration from at least two additional independent sources before publication.</li>
                <li><strong className="text-white">Editorial Board Approval:</strong> The use of any confidential source requires approval from our senior editorial board, who must be satisfied that the source is credible and that confidentiality is genuinely necessary.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">5. Continuous Source Evaluation</h2>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Source verification is not a one-time process. We continuously evaluate and re-assess the reliability of our source base through the following measures:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Regular audits of our source database to identify any sources whose reliability may have changed due to ownership changes, editorial shifts, or documented instances of inaccuracy</li>
                <li>Tracking the accuracy of sources over time by comparing their reporting against subsequent verified developments</li>
                <li>Incorporating feedback from our readers, who may have expertise or information that can help us evaluate the reliability of specific sources</li>
                <li>Staying informed about disinformation campaigns that may target or compromise previously reliable sources</li>
              </ul>
              <p>
                This continuous evaluation ensures that our source base remains robust and that our reporting reflects the most current assessment of source reliability.
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
              <Link href="/fact-checking" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Fact-Checking Policy</h3>
                <p className="text-sm text-[var(--muted)]">Our verification & correction process</p>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
