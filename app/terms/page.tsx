import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms and Conditions — The Longevity Scan",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <h2>The important part: this is a parody</h2>
      <p>
        <strong>
          The Longevity Scan is a work of parody, satire, and entertainment.
        </strong>{" "}
        The &ldquo;AI detection&rdquo;, the longevity model, the estimated date of
        death, the risk analysis, the model confidence figure, and the recoverable
        years are all <strong>fictional</strong>. They are not real medical,
        actuarial, scientific, or AI-driven assessments, and they do not predict
        anything about you or anyone else. No part of the scan is diagnostic and no
        data is used to compute a genuine life expectancy.
      </p>
      <p>
        The scan exists as <strong>marketing</strong> for The Second Wind Protocol,
        which is a real product. The estimate is a creative device intended to be
        entertaining and to introduce that product. Nothing on this site is medical
        advice. If you have concerns about your health, speak to a qualified
        medical professional.
      </p>

      <h2>Acceptance</h2>
      <p>
        By using this site you accept these terms. If you do not agree, please do
        not use the site.
      </p>

      <h2>Use of the site</h2>
      <p>
        You may use the scan for personal, non-commercial entertainment. You agree
        not to misuse the site, attempt to disrupt it, or rely on its output as
        factual information of any kind.
      </p>

      <h2>The product</h2>
      <p>
        The Second Wind Protocol is a digital fitness and lifestyle guide. Any
        prices shown are for that product. Promotional pricing and on-page
        countdown offers are marketing and may change. Purchasing is handled by our
        payment provider; their terms also apply at checkout.
      </p>
      <h2>Testimonials and imagery</h2>
      <p>
        Reviews, testimonials, and before and after transformation images shown
        anywhere on this site, including while a protocol is being prepared, are{" "}
        <strong>illustrative and AI-generated</strong>. They do not depict real
        customers, real people, or real results, and they are not a guarantee of
        any outcome.
      </p>

      <h2>No warranty and limitation of liability</h2>
      <p>
        The site is provided &ldquo;as is&rdquo; with no warranties of any kind. To
        the maximum extent permitted by law, we are not liable for any loss arising
        from your use of, or reliance on, this site or its fictional output.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content, branding, and copy on this site belong to the site operator
        and may not be reproduced without permission.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms at any time. Continued use of the site means you
        accept the current version.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to hello@longevityscan.example.
      </p>
    </LegalPage>
  );
}
