import * as Crypto from "expo-crypto";

export type ThreatVerdict = "clean" | "suspicious" | "malicious" | "unknown";

export type ScanSource = {
  name: string;
  verdict: ThreatVerdict;
  detail?: string;
};

export type ScanResult = {
  id: string;
  query: string;
  type: "url" | "domain" | "ip" | "hash" | "password" | "wifi";
  verdict: ThreatVerdict;
  score: number;
  sources: ScanSource[];
  details: Record<string, string>;
  scannedAt: number;
};

const URLHAUS_ENDPOINT = "https://urlhaus-api.abuse.ch/v1/url/";
const URLHAUS_HOST_ENDPOINT = "https://urlhaus-api.abuse.ch/v1/host/";
const HIBP_RANGE_ENDPOINT = "https://api.pwnedpasswords.com/range/";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function detectInputType(input: string): ScanResult["type"] {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return "url";
  if (/^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i.test(trimmed))
    return "hash";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(trimmed)) return "ip";
  if (/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(trimmed)) return "domain";
  return "url";
}

function suspiciousPatterns(input: string): string[] {
  const flags: string[] = [];
  const url = input.toLowerCase();
  const tldRisky = [
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".xyz",
    ".top",
    ".click",
    ".loan",
    ".work",
  ];
  if (tldRisky.some((t) => url.endsWith(t) || url.includes(t + "/")))
    flags.push("Uses high-risk top-level domain");
  if (/-secure-|verify-|account-update|login-/.test(url))
    flags.push("Phishing-style URL keywords detected");
  if (/\d{6,}/.test(url)) flags.push("Long numeric sequence in URL");
  if ((url.match(/-/g) || []).length >= 5)
    flags.push("Excessive hyphens in domain");
  if (/@/.test(url) && /^https?:\/\//.test(url))
    flags.push("URL contains '@' redirect");
  if (/\bbit\.ly\b|\btinyurl\b|\bt\.co\b|\bgoo\.gl\b/.test(url))
    flags.push("Shortened URL — destination unknown");
  if (/xn--/.test(url)) flags.push("Internationalized (punycode) domain");
  return flags;
}

function aggregate(sources: ScanSource[]): {
  verdict: ThreatVerdict;
  score: number;
} {
  let mal = 0,
    sus = 0,
    clean = 0;
  for (const s of sources) {
    if (s.verdict === "malicious") mal++;
    else if (s.verdict === "suspicious") sus++;
    else if (s.verdict === "clean") clean++;
  }
  const total = sources.length || 1;
  if (mal > 0)
    return {
      verdict: "malicious",
      score: Math.max(5, 30 - mal * 10 - sus * 5),
    };
  if (sus > 0) return { verdict: "suspicious", score: 55 - sus * 5 };
  if (clean > 0) return { verdict: "clean", score: 95 };
  return { verdict: "unknown", score: 70 };
}

export async function scanInput(input: string): Promise<ScanResult> {
  const trimmed = input.trim();
  const type = detectInputType(trimmed);
  const sources: ScanSource[] = [];
  const details: Record<string, string> = {};

  // 1. Heuristic scanner (always runs)
  const flags = suspiciousPatterns(trimmed);
  sources.push({
    name: "PulseGuard Heuristics",
    verdict: flags.length >= 2 ? "suspicious" : flags.length === 1 ? "suspicious" : "clean",
    detail:
      flags.length === 0
        ? "No suspicious patterns detected"
        : flags.join(" • "),
  });
  if (flags.length) details["Heuristic flags"] = String(flags.length);

  // 2. URLhaus (abuse.ch) — free, no key
  if (type === "url" || type === "domain" || type === "ip") {
    try {
      const isHostQuery = type !== "url";
      const endpoint = isHostQuery ? URLHAUS_HOST_ENDPOINT : URLHAUS_ENDPOINT;
      const body = new URLSearchParams();
      body.append(isHostQuery ? "host" : "url", trimmed);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.query_status === "ok") {
        const threat = data.threat || data.url_status || "known threat";
        sources.push({
          name: "URLhaus (abuse.ch)",
          verdict: "malicious",
          detail: `Listed as ${threat}`,
        });
        if (data.tags) details["Threat tags"] = String(data.tags);
        if (data.date_added)
          details["First seen"] = String(data.date_added).split(" ")[0] ?? "";
      } else if (data.query_status === "no_results") {
        sources.push({
          name: "URLhaus (abuse.ch)",
          verdict: "clean",
          detail: "Not found in malware database",
        });
      } else {
        sources.push({
          name: "URLhaus (abuse.ch)",
          verdict: "unknown",
          detail: data.query_status || "Inconclusive",
        });
      }
    } catch (_e) {
      sources.push({
        name: "URLhaus (abuse.ch)",
        verdict: "unknown",
        detail: "Lookup failed (offline?)",
      });
    }
  }

  // 3. Hash lookups via MalwareBazaar (free, no key)
  if (type === "hash") {
    try {
      const body = new URLSearchParams();
      body.append("query", "get_info");
      body.append("hash", trimmed);
      const res = await fetch("https://mb-api.abuse.ch/api/v1/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.query_status === "ok" && data.data?.length) {
        const sample = data.data[0];
        sources.push({
          name: "MalwareBazaar (abuse.ch)",
          verdict: "malicious",
          detail: `Identified as ${sample.signature || sample.file_type || "malware sample"}`,
        });
        if (sample.signature) details["Family"] = sample.signature;
        if (sample.file_type) details["File type"] = sample.file_type;
        if (sample.first_seen)
          details["First seen"] = String(sample.first_seen).split(" ")[0] ?? "";
      } else {
        sources.push({
          name: "MalwareBazaar (abuse.ch)",
          verdict: "clean",
          detail: "Hash not in known malware sample database",
        });
      }
    } catch (_e) {
      sources.push({
        name: "MalwareBazaar (abuse.ch)",
        verdict: "unknown",
        detail: "Lookup failed (offline?)",
      });
    }
  }

  const { verdict, score } = aggregate(sources);
  return {
    id: genId(),
    query: trimmed,
    type,
    verdict,
    score,
    sources,
    details,
    scannedAt: Date.now(),
  };
}

export async function checkPasswordBreach(
  password: string,
): Promise<{ pwned: boolean; count: number }> {
  const sha1 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    password,
  );
  const upper = sha1.toUpperCase();
  const prefix = upper.slice(0, 5);
  const suffix = upper.slice(5);
  const res = await fetch(HIBP_RANGE_ENDPOINT + prefix, {
    headers: { "Add-Padding": "true" },
  });
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const [s, c] = line.split(":");
    if (s && s.trim() === suffix) {
      const n = parseInt(c?.trim() ?? "0", 10);
      if (n > 0) return { pwned: true, count: n };
    }
  }
  return { pwned: false, count: 0 };
}

export function verdictColor(
  verdict: ThreatVerdict,
  c: { success: string; warning: string; destructive: string; mutedForeground: string },
) {
  if (verdict === "clean") return c.success;
  if (verdict === "suspicious") return c.warning;
  if (verdict === "malicious") return c.destructive;
  return c.mutedForeground;
}

export function verdictLabel(verdict: ThreatVerdict): string {
  if (verdict === "clean") return "Safe";
  if (verdict === "suspicious") return "Suspicious";
  if (verdict === "malicious") return "Threat detected";
  return "Inconclusive";
}
