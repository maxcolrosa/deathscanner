import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

// Monitor palette, mirrored from app/globals.css so the email reads on-brand in
// any client (email HTML cannot use Tailwind tokens, so the hex values live here).
const C = {
  bg: "#0a0e12",
  panel: "#10151b",
  line: "#1d2630",
  fg: "#e8eef2",
  muted: "#9fb0bd",
  accent: "#2ee6c9",
  alert: "#ff5e5e",
} as const;

const mono =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const sans =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface ReportEmailRisk {
  category: string;
  detail: string;
}

export interface ReportEmailData {
  deathDate: string;
  ageAtDeath: number;
  recoverableYears: number;
  topRisks: ReportEmailRisk[];
  priceLabel: string;
  offerUrl: string;
}

export function ReportEmail({
  deathDate,
  ageAtDeath,
  recoverableYears,
  topRisks,
  priceLabel,
  offerUrl,
}: ReportEmailData) {
  const years = Math.max(0, Math.round(recoverableYears));
  const risks = topRisks.slice(0, 3);

  return (
    <Html lang="en">
      <Head />
      <Preview>Your longevity scan result is ready inside.</Preview>
      <Body
        style={{
          margin: 0,
          padding: "24px 0",
          backgroundColor: C.bg,
          color: C.fg,
          fontFamily: sans,
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: C.panel,
            border: `1px solid ${C.line}`,
            borderRadius: "12px",
            padding: "32px",
          }}
        >
          <Text
            style={{
              margin: 0,
              fontFamily: mono,
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.alert,
            }}
          >
            AI analysis complete
          </Text>

          <Heading
            as="h1"
            style={{
              margin: "8px 0 4px",
              fontSize: "24px",
              lineHeight: 1.2,
              fontWeight: 600,
              color: C.fg,
            }}
          >
            Your result, in full
          </Heading>

          <Section
            style={{
              marginTop: "20px",
              border: `1px solid ${C.alert}40`,
              borderRadius: "10px",
              padding: "20px",
              backgroundColor: C.bg,
            }}
          >
            <Text
              style={{
                margin: 0,
                fontFamily: mono,
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Estimated date of death
            </Text>
            <Text
              style={{
                margin: "6px 0 0",
                fontFamily: mono,
                fontSize: "40px",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: C.alert,
              }}
            >
              {deathDate}
            </Text>
            <Text
              style={{
                margin: "8px 0 0",
                fontFamily: mono,
                fontSize: "13px",
                color: C.muted,
              }}
            >
              Around {ageAtDeath} years old.
            </Text>
          </Section>

          {years > 0 ? (
            <Text
              style={{
                margin: "20px 0 0",
                fontSize: "15px",
                lineHeight: 1.6,
                color: C.fg,
              }}
            >
              Our model estimates roughly{" "}
              <span style={{ color: C.accent, fontWeight: 600 }}>
                {years} {years === 1 ? "year" : "years"}
              </span>{" "}
              are still on the table. These are the years tied to things you can
              change.
            </Text>
          ) : null}

          {risks.length > 0 ? (
            <Section style={{ marginTop: "24px" }}>
              <Text
                style={{
                  margin: "0 0 10px",
                  fontFamily: mono,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: C.muted,
                }}
              >
                What is costing you the most
              </Text>
              {risks.map((risk, i) => (
                <Section
                  key={`${risk.category}-${i}`}
                  style={{
                    borderTop: `1px solid ${C.line}`,
                    paddingTop: "12px",
                    paddingBottom: "12px",
                  }}
                >
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: C.fg,
                    }}
                  >
                    {risk.category}
                  </Text>
                  <Text
                    style={{
                      margin: "4px 0 0",
                      fontSize: "13px",
                      lineHeight: 1.55,
                      color: C.muted,
                    }}
                  >
                    {risk.detail}
                  </Text>
                </Section>
              ))}
            </Section>
          ) : null}

          <Hr style={{ borderColor: C.line, margin: "24px 0" }} />

          <Text
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              lineHeight: 1.6,
              color: C.fg,
            }}
          >
            Your full 90-day plan is built from these same answers. It turns the
            risks above into a week-by-week program you can start today, from{" "}
            <span style={{ color: C.fg, fontWeight: 600 }}>{priceLabel}</span>.
          </Text>

          <Button
            href={offerUrl}
            style={{
              display: "inline-block",
              backgroundColor: C.accent,
              color: C.bg,
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              padding: "14px 28px",
              borderRadius: "8px",
            }}
          >
            Unlock your full 90-day plan
          </Button>

          <Text
            style={{
              margin: "24px 0 0",
              fontFamily: mono,
              fontSize: "12px",
              lineHeight: 1.6,
              color: "#6b7a87",
              wordBreak: "break-all",
            }}
          >
            Or paste this into your browser:
            <br />
            <Link href={offerUrl} style={{ color: C.muted }}>
              {offerUrl}
            </Link>
          </Text>
        </Container>

        <Container style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Text
            style={{
              margin: "16px 0 0",
              padding: "0 16px",
              fontFamily: mono,
              fontSize: "11px",
              lineHeight: 1.6,
              color: "#6b7a87",
              textAlign: "center",
            }}
          >
            Sent by ColrosaStudios LTD because you ran a scan and asked for your
            report. The estimate is generated for entertainment, not medical use.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Render the component to an HTML string for sending and for tests. React Email's
// render() is async in current versions, so callers await it.
export function renderReportEmail(data: ReportEmailData): Promise<string> {
  return render(<ReportEmail {...data} />);
}
