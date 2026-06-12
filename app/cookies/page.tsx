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
        <strong>Essential and functional storage only.</strong> We use a small
        amount of first-party browser storage, none of which tracks you across
        other websites or identifies you personally:
      </p>
      <p>
        <strong>Offer timer (local storage).</strong> When your scan result is
        shown with a launch-price countdown, the deadline is stored in your
        browser&rsquo;s local storage. This exists so the countdown is honest:
        it does not reset if you refresh the page or run the scan again. It
        contains only a timestamp, no personal data and no identifier, and it
        is never sent to us or to anyone else.
      </p>
      <p>
        <strong>Access cookie.</strong> Where access to the site is restricted
        (for example during a preview period), a cookie remembers that you
        entered the correct access password so you are not asked again on every
        page. It contains no personal data.
      </p>

      <h2>What we do not use</h2>
      <p>
        We do not use advertising cookies, analytics cookies, cross-site
        tracking pixels, or profiling technologies that follow you around the
        web. The scan does not set cookies that identify you personally.
        Because we only use storage that is necessary for features you have
        asked for, we do not show a cookie consent banner; if we ever introduce
        non-essential cookies such as analytics, we will ask for your consent
        first.
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
