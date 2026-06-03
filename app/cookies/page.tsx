import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookies Policy — The Longevity Scan",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies Policy">
      <h2>Summary</h2>
      <p>
        This is a parody site (see our{" "}
        <a href="/terms">Terms and Conditions</a>). We keep browser storage to a
        minimum and do not run third-party advertising trackers.
      </p>

      <h2>What we use</h2>
      <p>
        <strong>Essential only.</strong> The site needs a small amount of
        in-browser state to function, for example to remember where you are in the
        scan during your visit. The limited-time offer countdown runs in your
        browser&rsquo;s memory for the current page and is{" "}
        <strong>not persisted</strong>; refreshing the page resets it.
      </p>

      <h2>What we do not use</h2>
      <p>
        We do not use advertising cookies, cross-site tracking pixels, or profiles
        that follow you around the web. The scan does not set cookies that identify
        you.
      </p>

      <h2>Analytics</h2>
      <p>
        Any analytics we use are aggregate and privacy-conscious, intended only to
        count visits and completions, not to identify individuals.
      </p>

      <h2>Managing storage</h2>
      <p>
        You can clear site data and cookies at any time through your browser
        settings. Doing so will reset the scan and the offer timer.
      </p>

      <h2>Contact</h2>
      <p>Questions can be sent to privacy@longevityscan.example.</p>
    </LegalPage>
  );
}
