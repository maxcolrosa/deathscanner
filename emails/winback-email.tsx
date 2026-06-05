import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
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

export interface WinbackEmailData {
  winbackPriceLabel: string;
  listPriceLabel: string;
  winbackUrl: string;
}

// Drip email 3 (+2 days): an honest one-time win-back. The on-page launch
// countdown really has ended by now, so this is a genuine new, lower offer, not
// a reset of a fake timer. The link carries a signed token that unlocks the
// winback price server-side.
export function WinbackEmail({ winbackPriceLabel, listPriceLabel, winbackUrl }: WinbackEmailData) {
  return (
    <Html lang="en">
      <Head />
      <Preview>A one-time price to come back and start your plan.</Preview>
      <Body style={{ margin: 0, padding: "24px 0", backgroundColor: C.bg, color: C.fg, fontFamily: sans }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: C.panel, border: `1px solid ${C.line}`, borderRadius: "12px", padding: "32px" }}>
          <Text style={{ margin: 0, fontFamily: mono, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.accent }}>
            One-time offer
          </Text>
          <Heading as="h1" style={{ margin: "8px 0 16px", fontSize: "23px", lineHeight: 1.25, fontWeight: 600, color: C.fg }}>
            Your launch price ended. Here is a way back in.
          </Heading>
          <Text style={{ margin: "0 0 20px", fontSize: "15px", lineHeight: 1.6, color: C.fg }}>
            You looked at your number but did not start the plan. We get it, life
            is busy. So here is a one-time price to make it easy to begin.
          </Text>

          <Section style={{ border: `1px solid ${C.accent}40`, borderRadius: "10px", padding: "20px", backgroundColor: C.bg, textAlign: "center" }}>
            <Text style={{ margin: 0, fontFamily: mono, fontSize: "13px", color: C.muted, textDecoration: "line-through" }}>
              {listPriceLabel}
            </Text>
            <Text style={{ margin: "4px 0 0", fontFamily: mono, fontSize: "44px", lineHeight: 1.05, fontWeight: 600, color: C.fg }}>
              {winbackPriceLabel}
            </Text>
            <Text style={{ margin: "6px 0 0", fontFamily: mono, fontSize: "12px", color: C.muted }}>
              one time, yours to keep
            </Text>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "24px" }}>
            <Button href={winbackUrl} style={{ display: "inline-block", backgroundColor: C.accent, color: C.bg, fontWeight: 600, fontSize: "15px", textDecoration: "none", padding: "14px 32px", borderRadius: "8px" }}>
              Start my plan for {winbackPriceLabel}
            </Button>
          </Section>

          <Text style={{ margin: "24px 0 0", fontFamily: mono, fontSize: "11px", lineHeight: 1.6, color: "#6b7a87" }}>
            Sent by ColrosaStudios LTD. You are getting this because you opted in
            for tips and offers. Use the unsubscribe link to stop.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderWinbackEmail(data: WinbackEmailData): Promise<string> {
  return render(<WinbackEmail {...data} />);
}
