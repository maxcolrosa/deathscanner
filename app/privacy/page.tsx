import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | The Longevity Scan",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>Who we are</h2>
      <p>
        This site is operated by <strong>ColrosaStudios LTD</strong>, a company
        registered in England and Wales [company number to be added]. Registered
        office: [registered office address to be added]. &ldquo;Longevity
        Scan&rdquo; is a trading name of ColrosaStudios LTD. ColrosaStudios LTD
        is the data controller for any personal data processed in connection
        with this site and the purchase of The Second Wind Protocol.
      </p>
      <p>
        This policy should be read alongside our{" "}
        <a href="/terms">Terms and Conditions</a> and{" "}
        <a href="/cookies">Cookies Policy</a>. This site is a parody and
        entertainment product; the scan and its fictional output are explained
        in full in our Terms.
      </p>

      <h2>Your scan answers</h2>
      <p>
        The questions you answer during the scan are processed entirely within
        your browser to produce the on-screen result.{" "}
        <strong>
          Your answers are not sent to or stored on our servers, and they are
          not linked to your identity.
        </strong>{" "}
        Close the tab and they are gone. We do not process your scan answers as
        personal data.
      </p>

      <h2>What we do not collect through the scan</h2>
      <p>
        We do not require an account to use the scan. We do not ask for your
        name, email address, or any health records to run the scan. We do not
        sell or share personal data gathered via the scan, because we do not
        collect personal data through the scan.
      </p>

      <h2>If you buy the guide</h2>
      <p>
        If you purchase The Second Wind Protocol, payment and any personal
        details you provide at checkout (such as name, email address, and
        payment information) are handled by our third-party payment processor
        under their own privacy policy. We receive only the information we need
        to deliver the product and communicate with you about your purchase.
        Our lawful basis for processing purchase-related personal data is
        performance of a contract with you.
      </p>

      <h2>Analytics</h2>
      <p>
        We may use privacy-conscious, aggregate analytics to understand how many
        people visit and complete the scan. This data is aggregated and does not
        identify you personally. Our lawful basis for this processing is our
        legitimate interests in understanding how the site is used so we can
        improve it.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain purchase-related personal data for as long as is necessary to
        fulfil our contractual obligations to you and to comply with our legal
        obligations (for example, financial record-keeping requirements). Where
        data is held by our third-party processor, their retention policies
        apply.
      </p>

      <h2>International transfers</h2>
      <p>
        Where we use third-party processors (such as payment or analytics
        providers), your data may be processed in countries outside the UK or
        European Economic Area. We take steps to ensure that any such transfers
        are subject to appropriate safeguards in accordance with applicable data
        protection law.
      </p>

      <h2>Your rights under UK GDPR and the Data Protection Act 2018</h2>
      <p>
        Where we hold personal data about you, you have the following rights:
      </p>
      <p>
        <strong>Access:</strong> you may request a copy of the personal data
        we hold about you.
      </p>
      <p>
        <strong>Rectification:</strong> you may ask us to correct inaccurate
        personal data.
      </p>
      <p>
        <strong>Erasure:</strong> you may ask us to delete your personal data
        in certain circumstances.
      </p>
      <p>
        <strong>Restriction:</strong> you may ask us to restrict the processing
        of your personal data in certain circumstances.
      </p>
      <p>
        <strong>Objection:</strong> you may object to processing based on our
        legitimate interests.
      </p>
      <p>
        <strong>Portability:</strong> you may request a copy of personal data
        you have provided to us in a structured, commonly used, machine-readable
        format.
      </p>
      <p>
        Because we do not store personal data from the scan itself, most of
        these rights are most likely to be relevant in the context of a
        purchase. To exercise any of these rights, please contact us using the
        details in the Contact section below.
      </p>

      <h2>Right to complain</h2>
      <p>
        You have the right to lodge a complaint with the Information
        Commissioner&rsquo;s Office (ICO), the UK supervisory authority for
        data protection, at{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
          ico.org.uk
        </a>
        . We would appreciate the opportunity to address any concern before you
        contact the ICO, so please do reach out to us first.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last
        updated&rdquo; date at the top of this page shows the version currently
        in effect. Continued use of the site after changes are posted
        constitutes your acceptance of the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        A dedicated support contact will be published here shortly. Until then,
        correspondence (including data subject requests) may be addressed to
        ColrosaStudios LTD. You may also contact the ICO directly at{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
          ico.org.uk
        </a>
        .
      </p>
    </LegalPage>
  );
}
