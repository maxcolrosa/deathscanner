import {
  PRICES,
  SUPPORTED_CURRENCIES,
  type Currency,
} from "@/lib/product";

// Deadpan, minimal money formatting: "{symbol}{whole amount}". Prices are whole
// charm numbers, so no decimals. Kept as one helper so every display site reads
// the same source instead of hardcoding "$".
export function formatMoney(amount: number, currency: Currency): string {
  const tier = PRICES[currency] ?? PRICES.USD;
  return `${tier.symbol}${amount}`;
}

export function symbolFor(currency: Currency): string {
  return (PRICES[currency] ?? PRICES.USD).symbol;
}

export function isCurrency(value: string | null | undefined): value is Currency {
  return Boolean(value) && (SUPPORTED_CURRENCIES as readonly string[]).includes(value as string);
}

// ISO country code (from x-vercel-ip-country) -> charged currency. Anything not
// mapped falls back to USD, which matches the US-native default of the funnel.
const COUNTRY_CURRENCY: Record<string, Currency> = {
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  NZ: "AUD",
  // Eurozone (and close-enough neighbours that expect EUR)
  AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR", ES: "EUR", FI: "EUR",
  FR: "EUR", GR: "EUR", IE: "EUR", IT: "EUR", LT: "EUR", LU: "EUR", LV: "EUR",
  MT: "EUR", NL: "EUR", PT: "EUR", SI: "EUR", SK: "EUR",
};

export function currencyForCountry(code: string | null | undefined): Currency {
  if (!code) return "USD";
  return COUNTRY_CURRENCY[code.toUpperCase()] ?? "USD";
}

// Resolve the currency to charge/display. A `?cur=` override wins (for testing
// and manual switching); otherwise we map the geo country; otherwise USD.
export function resolveCurrency(
  country: string | null | undefined,
  override?: string | string[] | null,
): Currency {
  const raw = Array.isArray(override) ? override[0] : override;
  const upper = raw?.toUpperCase();
  if (isCurrency(upper)) return upper;
  return currencyForCountry(country);
}
