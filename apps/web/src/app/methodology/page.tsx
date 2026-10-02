import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Database, GitBranch, BarChart3, Users, FileSearch, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Research Methodology — Analytical Framework',
  description: 'Global Chanakya Research Methodology details our intelligence collection, multi-source verification, analytical frameworks, and publication standards for geopolitical analysis.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <GitBranch className="w-4 h-4" /> Research Framework
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white leading-[1.1]">
            Research Methodology
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-[1.8] font-medium max-w-3xl">
            Our research methodology provides the systematic framework that underlies all intelligence reports, strategic analyses, and geopolitical assessments published on Global Chanakya. Every piece of content follows a structured process from data collection through peer review to publication.
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-16">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Database className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Intelligence Collection</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Global Chanakya employs a structured, multi-layered intelligence collection methodology. Our analysts gather information from a diverse range of verified, credible sources to build a comprehensive picture of geopolitical events and trends. Our collection process is designed to minimise blind spots and maximise the breadth and depth of information available for analysis.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Open Source Intelligence (OSINT)</h3>
              <p>
                The foundation of our intelligence collection is open-source information gathered from publicly available sources. This includes government publications, diplomatic cables, parliamentary records, official press releases, and public statements from heads of state. We also monitor defence ministry publications, budget documents, and military procurement announcements from nations across the globe.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Academic & Think Tank Research</h3>
              <p>
                We regularly consult peer-reviewed academic journals, policy papers from leading think tanks (such as RAND Corporation, Brookings Institution, Carnegie Endowment, IISS, Observer Research Foundation, and SIPRI), and university research departments specialising in international relations, defence studies, and security studies.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Media Monitoring</h3>
              <p>
                Our team monitors news output from major international wire services (Reuters, AP, AFP), regional media outlets in local languages, specialised defence and security publications, and verified social media accounts of government officials, military leaders, and diplomatic corps across multiple time zones and regions.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Economic & Trade Data</h3>
              <p>
                For economic and trade analysis, we source data from the World Bank, International Monetary Fund, World Trade Organization, national central banks, and recognised economic research institutions. We track trade balances, foreign direct investment flows, sanctions regimes, and bilateral economic agreements.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Search className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. Multi-Source Verification</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Before any information is incorporated into our analysis, it undergoes a rigorous multi-source verification process. This process is designed to filter out misinformation, propaganda, and unverified claims that are prevalent in the geopolitical information landscape.
              </p>
              <p>
                Our verification protocol requires:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Minimum Two Independent Sources:</strong> Every factual claim must be corroborated by at least two independent sources. For high-stakes claims (e.g., military deployments, diplomatic ruptures), we require three or more independent confirmations.</li>
                <li><strong className="text-white">Source Credibility Assessment:</strong> Each source is evaluated based on its track record, institutional backing, potential biases, and proximity to the event being reported. Sources are classified on a reliability scale from A (highly reliable) to D (unverified).</li>
                <li><strong className="text-white">Cross-Regional Validation:</strong> When covering international events, we cross-reference reporting from media outlets in different countries to identify potential national biases and develop a more accurate picture of events.</li>
                <li><strong className="text-white">Temporal Consistency:</strong> We verify that information is consistent across time — checking that claims are supported by historical context and are not contradicted by previously established facts.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Analytical Frameworks</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Our analysts employ a range of established analytical frameworks to transform raw intelligence into actionable strategic insights. The choice of framework depends on the nature of the geopolitical issue being analysed:
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Geopolitical Net Assessment</h3>
              <p>
                For evaluating the relative strategic positions of competing powers, we employ net assessment methodology. This involves comparing the military capabilities, economic resources, diplomatic influence, technological advantages, and societal resilience of the parties involved. This approach allows us to identify structural advantages and vulnerabilities that may not be apparent from surface-level analysis.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Game Theory & Strategic Interaction Analysis</h3>
              <p>
                When analysing scenarios involving strategic decision-making between multiple actors (such as arms races, trade negotiations, or territorial disputes), we apply game-theoretic models to map out possible strategies, payoffs, and likely outcomes. This helps our readers understand the strategic logic behind seemingly irrational decisions.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">SWOT Analysis for National Strategy</h3>
              <p>
                We adapt the SWOT (Strengths, Weaknesses, Opportunities, Threats) framework for national-level strategic assessment, evaluating countries&apos; positions in terms of their internal capabilities, structural vulnerabilities, external opportunities, and emerging threats.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Historical Pattern Analysis</h3>
              <p>
                Many geopolitical patterns are cyclical or follow historical precedents. Our analysts study historical case studies — from the Concert of Europe to the Cold War to modern multipolarity — to identify patterns, rhymes, and potential trajectories of current situations.
              </p>
              <h3 className="text-lg font-bold text-white mt-6">Scenario Planning</h3>
              <p>
                For forward-looking analyses, we develop multiple plausible scenarios (best case, most likely, worst case) based on key variables and their potential interactions. Each scenario is assigned a probability assessment based on available evidence and historical precedent.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">4. Peer Review & Quality Control</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Every intelligence report and analytical piece undergoes internal peer review before publication. Our quality control process is designed to catch errors, challenge assumptions, and ensure that our analysis meets the highest standards of rigour:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">First Review:</strong> The analyst&apos;s draft is reviewed by a subject-matter expert on our editorial team who specialises in the relevant region or topic area. This reviewer evaluates the accuracy of facts, the soundness of analytical reasoning, and the strength of evidence supporting the conclusions.</li>
                <li><strong className="text-white">Structural Review:</strong> A senior editor reviews the piece for clarity, logical flow, and readability. This ensures that complex geopolitical analysis is presented in a way that is accessible to our diverse readership without sacrificing analytical depth.</li>
                <li><strong className="text-white">Final Approval:</strong> The editorial board provides final approval, ensuring that the piece meets our editorial standards and does not contain any unintended biases or blind spots.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">5. Publication Standards</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                All published content on Global Chanakya adheres to a consistent set of publication standards designed to ensure transparency, readability, and utility for our readers:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Clear Attribution:</strong> Every report identifies its author, publication date, and the date of the most recent update. Sources are cited within the text or in footnotes.</li>
                <li><strong className="text-white">Content Classification:</strong> Reports are categorised by region, topic, and content type (news report, strategic analysis, or opinion/commentary) to help readers navigate our content effectively.</li>
                <li><strong className="text-white">Executive Summary:</strong> Long-form intelligence reports include a concise executive summary at the top, allowing readers to quickly assess the key findings before reading the full analysis.</li>
                <li><strong className="text-white">Visual Aids:</strong> Where appropriate, we include maps, charts, infographics, and data visualisations to support our written analysis and make complex information more accessible.</li>
                <li><strong className="text-white">Related Intelligence:</strong> Each report links to related articles, background briefs, and contextual resources to help readers build a deeper understanding of the topic.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">6. Limitations & Transparency</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                We acknowledge the inherent limitations of geopolitical analysis and are transparent about the boundaries of our methodology:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Geopolitical forecasting involves inherent uncertainty. Our assessments represent informed analysis, not predictions of certain outcomes.</li>
                <li>Access to classified information is limited. Our analysis is based on open-source intelligence and may not account for undisclosed factors.</li>
                <li>Cultural and linguistic barriers may affect the interpretation of sources from certain regions. We mitigate this by employing analysts with regional expertise and language capabilities.</li>
                <li>The rapidly evolving nature of geopolitical events means that analyses may be overtaken by developments. We update our reports when significant new information emerges.</li>
              </ul>
              <p>
                By being transparent about these limitations, we aim to help our readers calibrate their reliance on our analysis and combine it with their own judgement and additional sources.
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
              <Link href="/source-verification" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Source Verification</h3>
                <p className="text-sm text-[var(--muted)]">Source hierarchy & reliability criteria</p>
              </Link>
              <Link href="/contributor-policy" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Contributor Policy</h3>
                <p className="text-sm text-[var(--muted)]">Guidelines for contributing analysts</p>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
