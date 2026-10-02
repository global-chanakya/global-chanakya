import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, BookOpen, Scale, AlertTriangle, Users, FileCheck, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Editorial Policy — Standards & Principles',
  description: 'Global Chanakya Editorial Policy outlines our commitment to accuracy, independence, transparency, and ethical geopolitical reporting. Learn about our editorial standards, corrections policy, and reader accountability framework.',
};

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <Shield className="w-4 h-4" /> Trust & Ethics
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white leading-[1.1]">
            Editorial Policy
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-[1.8] font-medium max-w-3xl">
            Our editorial policy governs every piece of intelligence, analysis, and reporting published on Global Chanakya. These standards ensure our readers receive accurate, impartial, and transparent geopolitical coverage.
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-16">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Editorial Independence</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Global Chanakya operates as an editorially independent platform. Our analysis and reporting are not influenced by any government body, corporate sponsor, political party, or foreign entity. We do not accept funding or editorial direction from state actors, intelligence agencies, or partisan organisations.
              </p>
              <p>
                Our editorial team makes all decisions regarding content selection, analysis angles, and publication timing independently. No external party has the right to review, approve, or modify our content prior to publication. This independence is the foundation of our credibility and the trust our readers place in us.
              </p>
              <p>
                When we partner with external contributors or analysts, we require full disclosure of any potential conflicts of interest. All partnerships and sponsored content (if any) are clearly labelled and separated from our editorial output.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. Accuracy & Verification Standards</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Accuracy is the cornerstone of our editorial process. Every claim, statistic, and assertion published on Global Chanakya undergoes a rigorous verification process before publication. We adhere to the following standards:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Multi-Source Verification:</strong> All factual claims are verified against at least two independent, credible sources before publication. In cases involving sensitive geopolitical claims, we require a minimum of three independent sources.</li>
                <li><strong className="text-white">Primary Source Priority:</strong> We prioritise primary sources including official government statements, declassified documents, treaty texts, United Nations resolutions, and direct interviews with officials and subject-matter experts.</li>
                <li><strong className="text-white">Data Integrity:</strong> Statistical data, economic figures, and military capability assessments are sourced from recognised institutions such as the World Bank, IMF, SIPRI, IISS, and official national statistical offices.</li>
                <li><strong className="text-white">Attribution:</strong> All sources are attributed clearly within the text. Where source confidentiality is required (e.g., sensitive OSINT), we explain the nature and reliability of the source without compromising its identity.</li>
                <li><strong className="text-white">Timeliness:</strong> We verify that information is current and contextually relevant. Outdated data is explicitly identified as historical when used for comparative analysis.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Content Standards & Classification</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                We clearly distinguish between different types of content published on our platform to help readers understand the nature and intent of each piece:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Intelligence Reports:</strong> In-depth analytical pieces that provide comprehensive assessments of geopolitical situations, combining factual reporting with expert analysis and strategic forecasting.</li>
                <li><strong className="text-white">Breaking Intel:</strong> Timely updates on developing situations that are verified for accuracy but may evolve as new information emerges. These are clearly timestamped and updated as events unfold.</li>
                <li><strong className="text-white">Opinion & Analysis:</strong> Clearly labelled analytical pieces where our analysts offer their strategic assessments and forecasts. While grounded in verified facts, these pieces contain subjective expert judgements.</li>
                <li><strong className="text-white">Data Briefs:</strong> Statistical and data-driven reports that present quantitative analysis of defence spending, economic indicators, trade flows, and other measurable geopolitical metrics.</li>
              </ul>
              <p>
                Every published piece includes clear metadata indicating its category, publication date, author credentials, and the date of last update. This transparency enables our readers to assess the context and currency of our reporting.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">4. Impartiality & Non-Partisan Approach</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Global Chanakya is committed to non-partisan geopolitical analysis. We do not align with any political ideology, national interest, or geopolitical bloc. Our analysts are trained to present multiple perspectives on any given issue, ensuring that our readers receive a balanced view of complex situations.
              </p>
              <p>
                When covering conflicts, disputes, or geopolitical tensions, we present the positions, interests, and strategic rationales of all relevant parties. We avoid framing any nation, government, or group as inherently good or evil, instead focusing on objective analysis of actions, motivations, and consequences.
              </p>
              <p>
                Our analysts are required to disclose any personal biases, national affiliations, or professional connections that might influence their analysis. Where such potential conflicts exist, we either assign the piece to a different analyst or clearly disclose the potential bias to our readers.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">5. Corrections & Retraction Policy</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                We hold ourselves accountable for the accuracy of our content. When errors are identified — whether by our team, our readers, or external parties — we follow a transparent and prompt correction process:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Minor Corrections:</strong> Typographical errors, grammatical mistakes, and minor factual inaccuracies (such as incorrect dates or misspelled names) are corrected immediately. A correction note is appended to the article indicating the nature and date of the correction.</li>
                <li><strong className="text-white">Significant Corrections:</strong> Errors that materially affect the meaning, analysis, or conclusions of a piece are corrected with a prominent correction notice at the top of the article. The original text is preserved with strikethrough formatting so readers can see what was changed.</li>
                <li><strong className="text-white">Retractions:</strong> In rare cases where an article is found to be fundamentally flawed or based on unreliable sources, we issue a full retraction. The retraction notice explains the reasons for the retraction and remains permanently accessible at the original URL.</li>
                <li><strong className="text-white">Updates:</strong> When new information emerges that supplements or modifies a previously published analysis, we add an update section to the original article clearly dated and labelled as an editorial update.</li>
              </ul>
              <p>
                We encourage our readers to report any errors or concerns by contacting our editorial team at <strong>editorglobalchanakya.com@gmail.com</strong>. All reports are reviewed within 48 hours by our editorial board.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">6. Conflicts of Interest</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                All members of the Global Chanakya editorial team and contributing analysts are required to disclose any potential conflicts of interest that could influence their reporting or analysis. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Financial interests in companies, industries, or sectors covered in their analysis</li>
                <li>Political affiliations, party memberships, or active involvement in political campaigns</li>
                <li>Employment history with government agencies, military organisations, or intelligence services</li>
                <li>Personal relationships with individuals or organisations that are subjects of coverage</li>
                <li>Consulting arrangements, advisory roles, or paid speaking engagements with entities covered in reporting</li>
              </ul>
              <p>
                Our editorial board reviews all disclosed conflicts and determines whether an analyst should recuse themselves from specific coverage areas. In cases where disclosure alone is sufficient, a conflict of interest statement is published alongside the relevant content.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">7. Reader Complaints & Accountability</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                We value feedback from our readers and take all complaints seriously. Our reader accountability framework ensures that concerns are addressed promptly and transparently:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Submission:</strong> Complaints can be submitted via our <Link href="/contact" className="text-[var(--gold)] hover:underline">Contact page</Link> or by emailing editorglobalchanakya.com@gmail.com with the subject line &quot;Editorial Complaint&quot;.</li>
                <li><strong className="text-white">Acknowledgement:</strong> All complaints are acknowledged within 24 hours of receipt.</li>
                <li><strong className="text-white">Investigation:</strong> Our editorial board reviews the complaint, re-examines the relevant content, and determines if a correction, clarification, or other action is warranted.</li>
                <li><strong className="text-white">Resolution:</strong> We aim to resolve all complaints within 7 business days. The complainant is informed of the outcome and any actions taken.</li>
                <li><strong className="text-white">Appeal:</strong> If the complainant is unsatisfied with the resolution, they may request a secondary review by our senior editorial board.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">8. Advertising & Commercial Content</h2>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Global Chanakya may display advertisements through trusted third-party advertising networks, including Google AdSense. We maintain a strict separation between our editorial content and any advertising displayed on our platform:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Advertisements are clearly distinguishable from editorial content and are served by automated ad networks — we do not control the specific ads displayed.</li>
                <li>Advertisers have no influence over our editorial decisions, content selection, or analytical conclusions.</li>
                <li>We do not publish advertorials, sponsored articles, or paid content without clear and prominent labelling.</li>
                <li>If any reader finds an advertisement inappropriate or misleading, they may report it through our <Link href="/contact" className="text-[var(--gold)] hover:underline">Contact page</Link>.</li>
              </ul>
            </div>
          </section>

          {/* Related Links */}
          <section className="pt-12 border-t border-[var(--border)]">
            <h2 className="text-xl font-bold text-white mb-6">Related Policies</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/fact-checking" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Fact-Checking Policy</h3>
                <p className="text-sm text-[var(--muted)]">Our multi-step verification process</p>
              </Link>
              <Link href="/methodology" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Research Methodology</h3>
                <p className="text-sm text-[var(--muted)]">Analytical frameworks & data sources</p>
              </Link>
              <Link href="/source-verification" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Source Verification</h3>
                <p className="text-sm text-[var(--muted)]">Source hierarchy & reliability criteria</p>
              </Link>
              <Link href="/contributor-policy" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Contributor Policy</h3>
                <p className="text-sm text-[var(--muted)]">Submission guidelines & standards</p>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
