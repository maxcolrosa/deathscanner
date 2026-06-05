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

const C = {
  bg: "#0a0e12",
  panel: "#10151b",
  line: "#1d2630",
  fg: "#e8eef2",
  muted: "#9fb0bd",
  accent: "#2ee6c9",
} as const;

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface ValueEmailData {
  recoverableYears: number;
  topRiskCategory: string | null;
  offerUrl: string;
  unsubscribeUrl: string;
}

// Drip email 2 (+1 day): reinforce value and answer the objections that stall
// the purchase. No discount yet, no fake urgency, no result-speed claims.
export function ValueEmail({ recoverableYears, topRiskCategory, offerUrl, unsubscribeUrl }: ValueEmailData) {
  const years = Math.max(0, Math.round(recoverableYears));
  return (
    <Html lang="en">
      <Head />
      <Preview>The years your scan flagged are the reachable kind.</Preview>
      <Body style={{ margin: 0, padding: "24px 0", backgroundColor: C.bg, color: C.fg, fontFamily: sans }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: C.panel, border: `1px solid ${C.line}`, borderRadius: "12px", padding: "32px" }}>
          <Text style={{ margin: 0, fontFamily: mono, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.accent }}>
            About your result
          </Text>
          <Heading as="h1" style={{ margin: "8px 0 16px", fontSize: "23px", lineHeight: 1.25, fontWeight: 600, color: C.fg }}>
            {years > 0 ? `Those ${years} years are the reachable kind` : "Your plan is the part you control"}
          </Heading>
          <Text style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.6, color: C.fg }}>
            The date your scan showed assumes nothing changes. The good news is
            that the biggest levers{topRiskCategory ? `, starting with your ${topRiskCategory.toLowerCase()},` : ""} are
            things you can actually change, and your plan goes after them in order
            of impact.
          </Text>

          <Section style={{ borderTop: `1px solid ${C.line}`, paddingTop: "16px" }}>
            <Text style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600, color: C.fg }}>It is not a subscription.</Text>
            <Text style={{ margin: "0 0 14px", fontSize: "13px", lineHeight: 1.55, color: C.muted }}>You pay once and the whole kit is yours to keep.</Text>
            <Text style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600, color: C.fg }}>No gym required.</Text>
            <Text style={{ margin: "0 0 14px", fontSize: "13px", lineHeight: 1.55, color: C.muted }}>It runs at home with almost nothing, and every move has an easier and a harder version.</Text>
            <Text style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600, color: C.fg }}>It is built from your answers.</Text>
            <Text style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: C.muted }}>Not a generic template. It is ordered by what is costing you the most.</Text>
          </Section>

          <Hr style={{ borderColor: C.line, margin: "24px 0" }} />

          <Button href={offerUrl} style={{ display: "inline-block", backgroundColor: C.accent, color: C.bg, fontWeight: 600, fontSize: "15px", textDecoration: "none", padding: "14px 28px", borderRadius: "8px" }}>
            See your full plan
          </Button>

          <Text style={{ margin: "24px 0 0", fontFamily: mono, fontSize: "11px", lineHeight: 1.6, color: "#6b7a87" }}>
            Sent by ColrosaStudios LTD because you opted in for tips and offers.{" "}
            <Link href={unsubscribeUrl} style={{ color: C.muted, textDecoration: "underline" }}>
              Unsubscribe
            </Link>{" "}
            any time and we will stop.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderValueEmail(data: ValueEmailData): Promise<string> {
  return render(<ValueEmail {...data} />);
}
