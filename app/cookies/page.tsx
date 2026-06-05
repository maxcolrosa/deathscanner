import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookies Policy | Vivrun",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies Policy">
      <h2>About this policy</h2>
      <p>
        This site is operated by <strong>ColrosaStudios LTD</strong>, trading
        as Vivrun. This policy explains how we use cookies and similar
        browser storage technologies. For broader details about data we hold,
        see our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>What we use</h2>
      <p>
        <strong>Essential only.</strong> The site needs a small amount of
        in-browser state to function, for example to remember where you are in
        the scan during your visit. The limited-time offer countdown runs in
        your browser&rsquo;s memory for the current page session and is{" "}
        <strong>not persisted</strong>; refreshing the page or opening a new
        tab resets it.
      </p>

      <h2>What we do not use</h2>
      <p>
        We do not use advertising cookies, cross-site tracking pixels, or
        profiling technologies that follow you around the web. The scan does not
        set cookies that identify you personally.
      </p>

      <h2>Analytics</h2>
      <p>
        Any analytics we use are aggregate and privacy-conscious, intended only
        to count visits and completions, not to identify individuals. Where
        analytics tools use cookies or local storage, we configure them to
        minimise personal data collection.
      </p>

      <h2>Managing storage</h2>
      <p>
        You can clear site data and cookies at any time through your browser
        settings. Doing so will reset the scan and the offer timer. Blocking all
        cookies may affect the functionality of the site.
      </p>

      <h2>Third-party cookies</h2>
      <p>
        Our third-party payment processor may set cookies during checkout under
        their own cookie policy. We have no control over third-party cookies set
        by external services, and you should refer to those services&rsquo; own
        policies for details.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Cookies Policy from time to time. The &ldquo;Last
        updated&rdquo; date at the top of this page shows the version currently
        in effect. Continued use of the site after changes are posted
        constitutes your acceptance of the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        A dedicated support contact will be published here shortly. Until then,
        correspondence may be addressed to ColrosaStudios LTD.
      </p>
    </LegalPage>
  );
}
