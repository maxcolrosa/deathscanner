import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — The Longevity Scan",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>Summary</h2>
      <p>
        This is a parody site (see our{" "}
        <a href="/terms">Terms and Conditions</a>). The scan and its estimated date
        of death are fictional and are not a real assessment. This policy explains
        the limited data involved.
      </p>

      <h2>Your scan answers</h2>
      <p>
        The questions you answer are processed entirely in your browser to produce
        the on-screen result. <strong>Your answers are not sent to or stored on our
        servers, and they are not linked to your identity.</strong> Close the tab
        and they are gone.
      </p>

      <h2>What we do not collect</h2>
      <p>
        We do not require an account. We do not ask for your name, email, or any
        health records to run the scan. We do not sell or share personal data,
        because we do not collect it through the scan.
      </p>

      <h2>If you buy the guide</h2>
      <p>
        If you purchase The Second Wind Protocol, payment and any details you
        provide at checkout are handled by our third-party payment processor under
        their own privacy policy. We receive only what we need to deliver the
        product.
      </p>

      <h2>Analytics</h2>
      <p>
        We may use privacy-conscious, aggregate analytics to understand how many
        people visit and complete the scan. This does not identify you personally.
      </p>

      <h2>Your rights</h2>
      <p>
        Because we do not store personal data from the scan, there is generally
        nothing for us to access, correct, or delete. For purchase-related data,
        contact us and we will help.
      </p>

      <h2>Contact</h2>
      <p>Privacy questions can be sent to privacy@longevityscan.example.</p>
    </LegalPage>
  );
}
