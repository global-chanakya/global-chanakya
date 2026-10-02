import { Metadata } from 'next';
import Link from 'next/link';
import { Users, FileText, Scale, Pencil, Mail, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contributor Policy — Submission Guidelines',
  description: 'Global Chanakya Contributor Policy outlines submission requirements, editorial standards for contributors, peer review process, content guidelines, and ethical obligations for guest analysts.',
};

export default function ContributorPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <Users className="w-4 h-4" /> Contributing Analysts
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white leading-[1.1]">
            Contributor Policy
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-[1.8] font-medium max-w-3xl">
            Global Chanakya welcomes contributions from recognised geopolitical analysts, defence correspondents, regional experts, diplomats, and scholars. This policy outlines the standards, guidelines, and process for contributing to our platform.
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-16">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Submission Requirements</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                All contributions to Global Chanakya must meet the following requirements to be considered for publication:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Original Content:</strong> Submissions must be original work that has not been previously published in any form (print, digital, or social media). We do not accept simultaneously submitted pieces that are under consideration at other publications.</li>
                <li><strong className="text-white">Predictive Analysis:</strong> Contributions must offer predictive analysis, strategic insight, or original research — not merely summaries of recent news events. We expect contributors to provide forward-looking assessments that help our readers understand the trajectory of geopolitical situations.</li>
                <li><strong className="text-white">Word Count:</strong> Standard intelligence reports should be between 1,200 and 2,500 words. In-depth strategic assessments may extend to 4,000 words with prior editorial approval. Breaking analysis pieces may be shorter (800–1,200 words) when timeliness is critical.</li>
                <li><strong className="text-white">Source Citations:</strong> All factual claims must be properly attributed to credible sources. Contributors should include inline citations or footnotes linking to primary and secondary sources that support their analysis.</li>
                <li><strong className="text-white">Author Bio:</strong> Contributors must provide a brief professional biography (100–150 words) outlining their relevant credentials, expertise, and institutional affiliations. This bio will be published alongside the article.</li>
                <li><strong className="text-white">Format:</strong> Submissions should be in Microsoft Word (.docx) or plain text format. Include a proposed headline, a 2-3 sentence abstract, and 3-5 relevant keywords or tags for categorisation.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Pencil className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">2. Content & Style Guidelines</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                All contributions must adhere to Global Chanakya&apos;s editorial standards and style guidelines:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Non-Partisan Analysis:</strong> All pieces must maintain strict objectivity and impartiality. We do not publish advocacy pieces, partisan opinion columns, or content that promotes a specific national agenda over objective analysis.</li>
                <li><strong className="text-white">Evidence-Based:</strong> Arguments and conclusions must be supported by verifiable evidence. Speculative analysis is acceptable when clearly labelled as such and grounded in established geopolitical frameworks.</li>
                <li><strong className="text-white">Clear Structure:</strong> Articles should follow a logical structure with clear headings, an executive summary, supporting analysis, and a conclusion. Complex arguments should be broken into digestible sections.</li>
                <li><strong className="text-white">Accessible Language:</strong> While we cater to a specialist audience, contributors should avoid unnecessary jargon and explain technical terms when first introduced. Our readership includes policymakers, students, and informed general readers alongside specialists.</li>
                <li><strong className="text-white">Data & Visuals:</strong> When relevant, contributors are encouraged to include data tables, maps, and charts that support their analysis. All visual elements must be properly attributed and free of copyright restrictions.</li>
                <li><strong className="text-white">No Plagiarism:</strong> All content must be the original work of the contributor. Plagiarism of any kind — including paraphrasing without attribution — will result in immediate rejection and permanent disqualification from future contributions.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Peer Review & Editorial Process</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                All contributions undergo our standard peer review and editorial process before publication:
              </p>
              <div className="space-y-4 mt-4">
                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Stage 1: Initial Review (2-3 business days)</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    Upon receipt, submissions are reviewed by our editorial desk for relevance, quality, and alignment with our content standards. Contributors will receive an acknowledgement email within 24 hours of submission and an initial decision within 2-3 business days.
                  </p>
                </div>
                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Stage 2: Expert Review (3-5 business days)</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    Accepted submissions are assigned to a subject-matter expert on our team who reviews the analytical rigour, factual accuracy, and source reliability of the piece. The reviewer may request revisions, additional sources, or clarifications.
                  </p>
                </div>
                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Stage 3: Copy Editing & Fact-Checking (2-3 business days)</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    Approved pieces undergo professional copy editing for grammar, style consistency, and clarity. All factual claims are independently fact-checked by our verification team following our standard fact-checking protocols.
                  </p>
                </div>
                <div className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)]">
                  <h3 className="font-bold text-white mb-2">Stage 4: Final Approval & Publication</h3>
                  <p className="text-sm text-white/80 leading-[1.7]">
                    The editorial board provides final approval and schedules the piece for publication. Contributors are notified of the publication date and provided with a preview link before the article goes live.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">4. Ethical Standards & Conflicts of Interest</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                Contributors to Global Chanakya are held to the same ethical standards as our internal editorial team:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-white">Conflict of Interest Disclosure:</strong> Contributors must disclose any financial interests, political affiliations, government employment (current or former), or consulting arrangements that could be perceived as influencing their analysis. Failure to disclose relevant conflicts of interest is grounds for rejection and potential publication retraction.</li>
                <li><strong className="text-white">No Pay-for-Play:</strong> We do not accept payments from third parties to publish favourable analysis. Contributors may not have financial arrangements with entities that are subjects of their reporting.</li>
                <li><strong className="text-white">Accuracy Commitment:</strong> Contributors are responsible for the accuracy of their factual claims and are expected to cooperate with our fact-checking team. If errors are discovered post-publication, contributors must assist with corrections promptly.</li>
                <li><strong className="text-white">Respect for Confidentiality:</strong> Contributors must not disclose confidential information obtained through their professional positions unless such disclosure is legally permissible and serves the public interest.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">5. Copyright & Intellectual Property</h2>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                By submitting content to Global Chanakya, contributors agree to the following intellectual property terms:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Contributors grant Global Chanakya a non-exclusive, worldwide, perpetual licence to publish, distribute, and promote the submitted content across our platform and social media channels.</li>
                <li>Contributors retain copyright over their original work and may republish the content on other platforms after a 7-day exclusivity window following initial publication on Global Chanakya.</li>
                <li>When republishing elsewhere, contributors must credit Global Chanakya as the original publisher with a link back to the original article.</li>
                <li>Global Chanakya reserves the right to make reasonable editorial modifications to submissions for clarity, accuracy, and style consistency, while preserving the author&apos;s intended meaning and analytical conclusions.</li>
              </ul>
            </div>
          </section>

          {/* How to Submit */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">6. How to Submit</h2>
            </div>
            <div className="space-y-4 text-white/85 leading-[1.8]">
              <p>
                To submit a contribution or pitch, please email your proposal or completed manuscript to <strong>editorglobalchanakya.com@gmail.com</strong> with the subject line &quot;Contribution Submission: [Your Proposed Title]&quot;.
              </p>
              <p>
                Your submission should include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The completed article or a detailed pitch outline (300–500 words)</li>
                <li>Your professional biography and credentials</li>
                <li>A conflict of interest disclosure statement</li>
                <li>Confirmation that the content is original and not under consideration elsewhere</li>
              </ul>
              <p>
                We review all submissions and respond within 3 business days. If you have questions about the submission process, please visit our <Link href="/contact" className="text-[var(--gold)] hover:underline">Contact page</Link> or reach out to our editorial desk directly.
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
              <Link href="/careers" className="p-5 rounded-sm bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                <h3 className="font-bold text-white group-hover:text-[var(--gold)] transition-colors mb-1">Careers</h3>
                <p className="text-sm text-[var(--muted)]">Join our intelligence desk</p>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
