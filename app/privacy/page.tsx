import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Vivrun",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>Who we are</h2>
      <p>
        This site is operated by <strong>ColrosaStudios LTD</strong>, a company
        registered in England and Wales [company number to be added]. Registered
        office: [registered office address to be added]. &ldquo;Vivrun&rdquo;
        is a trading name of ColrosaStudios LTD. ColrosaStudios LTD
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

      <h2>Your scan answers and email</h2>
      <p>
        You can browse the scan questions without giving us anything. To unlock
        and view your result, we ask for your email address at the end. When you
        submit it, your scan answers are sent to our servers and stored against
        your email so that we can email you a copy of your report and, if you go
        on to buy, build your personalized guide. We use a reputable third-party
        provider to deliver these emails. Our lawful basis for storing your
        answers and sending your report is taking steps at your request, and our
        legitimate interest in delivering the result you asked for.
      </p>

      <h2>Marketing emails (opt-in)</h2>
      <p>
        At the email step you can separately choose to receive tips and
        occasional offers. This is optional and is unticked by default. Where you
        opt in, our lawful basis is your consent, which you can withdraw at any
        time using the unsubscribe link in any marketing email or by contacting
        us. Withdrawing consent does not affect the one-off report email you
        asked for, and does not affect the lawfulness of processing before you
        withdrew.
      </p>

      <h2>What we do not do</h2>
      <p>
        We do not require you to create an account. We do not sell your personal
        data, and we do not share it for anyone else&rsquo;s marketing. We share
        data only with the processors that operate the service for us (such as
        our email and payment providers), so they can perform those functions on
        our behalf.
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
        We retain your email and scan answers for as long as you remain on our
        list or until you ask us to delete them; when you unsubscribe we stop
        sending marketing emails and remove or anonymize the associated data. We
        retain purchase-related personal data for as long as is necessary to
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
        These rights apply to the email and scan answers we store, to your
        marketing preferences, and to any purchase data. To exercise any of
        these rights, please contact us using the details in the Contact section
        below.
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
