import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Global Chanakya Disclaimer covers limitations of our geopolitical analysis, no professional advice, fair use, external links, advertising, errors and omissions, and views expressed by contributors.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Disclaimer</h1>
        <p className="text-sm text-[var(--muted)] mb-12">Last Updated: July 2026</p>

        <div className="space-y-12 text-white/85 leading-[1.8]">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. General Disclaimer</h2>
            <p>
              The information contained on Global Chanakya Intelligence (&quot;the Platform&quot;), available at <strong>www.globalchanakya.in</strong>, is provided for general informational and educational purposes only. While we strive to provide accurate, up-, and reliable geopolitical analysis, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the Platform for any purpose.
            </p>
            <p className="mt-3">
              Any reliance you place on such information is therefore strictly at your own risk. In no event will we be liable for any loss or damage, including without limitation indirect or consequential loss or damage, or any loss or damage whatsoever arising from the use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. No Professional Advice</h2>
            <p>
              The content published on Global Chanakya is intended solely for informational and educational purposes. It does not constitute, and should not be construed as:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Legal Advice:</strong> Our analysis of international law, treaties, and regulatory frameworks is for informational purposes only and should not replace consultation with qualified legal professionals.</li>
              <li><strong className="text-white">Financial or Investment Advice:</strong> Our economic and trade analysis should not be used as the basis for investment decisions. Always consult with qualified financial advisors before making investment decisions.</li>
              <li><strong className="text-white">Military or Security Advice:</strong> Our defence and security analysis is academic in nature and should not be used to inform operational military or security decisions.</li>
              <li><strong className="text-white">Diplomatic Advice:</strong> Our foreign policy analysis represents the views of our analysts and should not be relied upon as official guidance for diplomatic decision-making.</li>
            </ul>
            <p className="mt-3">
              We strongly recommend consulting qualified professionals in the relevant fields before making any decisions based on the information provided on this Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Uncertainty in Geopolitical Analysis</h2>
            <p>
              Geopolitical analysis and strategic forecasting inherently involve uncertainty, interpretation, and subjective judgement. The conclusions and forecasts presented in our intelligence reports represent the informed opinions of our analysts based on available evidence at the time of writing. They are not guarantees of future events or outcomes.
            </p>
            <p className="mt-3">
              The geopolitical landscape is dynamic and can change rapidly due to unforeseen events, policy shifts, and new information. Our analyses are snapshots based on information available at the time of publication and may be superseded by subsequent developments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Views & Opinions</h2>
            <p>
              The views and opinions expressed in articles, intelligence reports, and analyses on Global Chanakya are those of the individual authors and analysts and do not necessarily reflect the official policy or position of Global Chanakya Intelligence as an organisation.
            </p>
            <p className="mt-3">
              Guest contributions and external analyst pieces are published to provide diverse perspectives on complex geopolitical issues. The inclusion of any particular viewpoint does not constitute an endorsement of that viewpoint by Global Chanakya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. External Links</h2>
            <p>
              The Platform may contain links to external websites and resources that are provided for convenience and informational purposes only. Global Chanakya has no control over the content, nature, or availability of those external sites. The inclusion of any links does not necessarily imply a recommendation or endorsement of the views expressed within them.
            </p>
            <p className="mt-3">
              We make every effort to ensure that linked resources are from reputable sources, but we cannot guarantee the accuracy, relevance, or safety of external content. Users follow external links at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Errors & Omissions</h2>
            <p>
              While we take every care to ensure the accuracy and quality of the information on the Platform, errors and omissions may occur. We do not guarantee that the Platform is free from errors. When errors are identified, we follow our <Link href="/editorial-policy" className="text-[var(--gold)] hover:underline">corrections policy</Link> to address them promptly and transparently.
            </p>
            <p className="mt-3">
              If you discover an error in any of our publications, we encourage you to notify us at <strong>editorglobalchanakya.com@gmail.com</strong> so that we can investigate and make appropriate corrections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Fair Use</h2>
            <p>
              Global Chanakya may use copyrighted material that has not always been specifically authorised by the copyright owner. We make such material available for criticism, comment, news reporting, teaching, scholarship, and research in accordance with fair use provisions. We believe this constitutes &quot;fair use&quot; of any such copyrighted material as provided for in applicable copyright legislation.
            </p>
            <p className="mt-3">
              If you wish to use copyrighted material from our Platform for purposes of your own that go beyond fair use, you must obtain permission from the copyright owner. For licensing inquiries, please contact our editorial desk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Advertising Disclaimer</h2>
            <p>
              Global Chanakya may display advertisements through third-party advertising services, including Google AdSense. These advertisements are automatically served by advertising networks based on various factors including your browsing history and interests.
            </p>
            <p className="mt-3">
              The display of advertisements on our Platform does not constitute an endorsement, recommendation, or guarantee of the products, services, or claims made by the advertisers. Global Chanakya is not responsible for the content of any advertisements or for any transactions that may occur between you and third-party advertisers.
            </p>
            <p className="mt-3">
              Our editorial content is entirely independent of our advertising. Advertisers have no influence over our editorial decisions, content selection, or analytical conclusions.
            </p>
          </section>

          <hr className="border-[var(--border)] my-12" />
          <section>
            <p className="text-[var(--muted)]">
              For questions about this Disclaimer, please contact us via our <Link href="/contact" className="text-[var(--gold)] hover:underline">Contact page</Link> or email us at <strong>editorglobalchanakya.com@gmail.com</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
