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
        our email provider, our payment provider, and the AI provider that
        generates your Deepscan, described below), so they can perform those
        functions on our behalf.
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

      <h2>Your AI Deepscan</h2>
      <p>
        The Second Wind Protocol includes an optional &ldquo;AI Deepscan&rdquo;.
        If you choose to run it, you answer a further set of questions about your
        lifestyle and self-reported wellbeing (for example your activity,
        eating, sleep, and general wellbeing indicators such as an estimated
        resting heart rate band, a blood-pressure band you have been told, or
        broad symptom categories). Some of these answers may relate to your
        health. You provide them voluntarily, and you do not have to run the
        Deepscan to use the rest of the guide.
      </p>
      <p>
        To produce your written analysis, those answers, together with your
        earlier scan answers, are sent to a <strong>third-party AI provider</strong>{" "}
        that processes them on our behalf to generate the report, and the
        resulting report is then stored with your order so we can show it to you.
        We do not use your Deepscan answers to train any AI model, and we do not
        use them for marketing. Our lawful basis for this processing is
        performance of our contract with you (delivering the product you bought)
        and, to the extent any answers concern your health, your explicit consent
        given by choosing to provide them and run the analysis. You can withdraw
        that consent by contacting us, and you can ask us to delete your Deepscan
        answers and report at any time.
      </p>
      <p>
        The Deepscan is an educational, entertainment-oriented estimate generated
        from what you tell us. It is not a medical test, diagnosis, or treatment
        advice, as explained in our <a href="/terms">Terms and Conditions</a>.
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
        retain purchase-related personal data, including any Deepscan answers and
        the report generated from them, for as long as is necessary to fulfil our
        contractual obligations to you and to comply with our legal obligations
        (for example, financial record-keeping requirements), or until you ask us
        to delete it. Where data is held by our third-party processors, their
        retention policies also apply.
      </p>

      <h2>International transfers</h2>
      <p>
        Where we use third-party processors (such as our payment, analytics, or
        AI providers), your data may be processed in countries outside the UK or
        European Economic Area, including the United States. We take steps to
        ensure that any such transfers are subject to appropriate safeguards in
        accordance with applicable data protection law.
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
        marketing preferences, to any purchase data, and to any Deepscan answers
        and report we hold. To exercise any of these rights, please contact us
        using the details in the Contact section below.
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
