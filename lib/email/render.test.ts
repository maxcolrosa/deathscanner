import { describe, it, expect } from "vitest";
import { renderReportEmail } from "@/emails/report-email";

// Guard the React Email template the way pdf-render.test guards the PDFs:
// render() must produce real HTML with the user's data, so a broken template is
// caught here instead of being swallowed by captureLead's best-effort try/catch.
describe("ReportEmail render", () => {
  it("renders to HTML containing the personalized data", async () => {
    const html = await renderReportEmail({
      deathDate: "June 2061",
      ageAtDeath: 76,
      recoverableYears: 6,
      topRisks: [
        { category: "Tobacco use", detail: "The single most studied risk." },
        { category: "Physical activity", detail: "Low fitness is a strong predictor." },
      ],
      priceLabel: "$13",
      offerUrl: "https://example.com/scan",
    });
    expect(html).toContain("June 2061");
    expect(html).toContain("Tobacco use");
    expect(html).toContain("https://example.com/scan");
    expect(html.length).toBeGreaterThan(500);
  });

  it("renders without the reclaimable-years line when there are none", async () => {
    const html = await renderReportEmail({
      deathDate: "March 2058",
      ageAtDeath: 70,
      recoverableYears: 0,
      topRisks: [],
      priceLabel: "£11",
      offerUrl: "https://example.com/scan",
    });
    expect(html).toContain("March 2058");
    expect(html.length).toBeGreaterThan(300);
  });
});
