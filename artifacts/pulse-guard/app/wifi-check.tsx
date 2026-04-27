import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScoreRing } from "@/components/ScoreRing";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useColors } from "@/hooks/useColors";

type Check = {
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
};

type Report = {
  score: number;
  ip: string | null;
  country: string | null;
  isp: string | null;
  proxy: boolean;
  hosting: boolean;
  https: boolean;
  checks: Check[];
};

async function runWifiCheck(): Promise<Report> {
  const checks: Check[] = [];
  let ip: string | null = null;
  let country: string | null = null;
  let isp: string | null = null;
  let proxy = false;
  let hosting = false;
  let https = false;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    ip = data.ip ?? null;
    country = data.country_name ?? null;
    isp = data.org ?? data.asn ?? null;
  } catch (_e) {
    // continue
  }

  try {
    if (ip) {
      const r = await fetch(`https://ipwho.is/${ip}`);
      const d = await r.json();
      proxy = !!(d.connection?.proxy ?? false);
      hosting = (d.connection?.org ?? "").toLowerCase().includes("hosting");
    }
  } catch (_e) {
    // continue
  }

  try {
    const httpsRes = await fetch("https://www.google.com/generate_204");
    https = httpsRes.status === 204 || httpsRes.ok;
  } catch (_e) {
    https = false;
  }

  checks.push({
    label: "Public IP detected",
    status: ip ? "ok" : "warn",
    detail: ip ?? "Could not determine IP address",
  });
  checks.push({
    label: "HTTPS connectivity",
    status: https ? "ok" : "fail",
    detail: https
      ? "Encrypted connections work normally"
      : "HTTPS calls failed — possible captive portal or interception",
  });
  checks.push({
    label: "Proxy / VPN",
    status: proxy ? "warn" : "ok",
    detail: proxy
      ? "Traffic appears to route through a proxy or VPN"
      : "Direct connection — no proxy detected",
  });
  checks.push({
    label: "Hosting / datacenter network",
    status: hosting ? "warn" : "ok",
    detail: hosting
      ? "ISP looks like a datacenter, not a residential carrier"
      : "Looks like a normal consumer network",
  });
  checks.push({
    label: "Network platform",
    status: Platform.OS === "web" ? "warn" : "ok",
    detail:
      Platform.OS === "web"
        ? "Browser preview: native Wi-Fi probes are limited"
        : `Running natively on ${Platform.OS}`,
  });

  let score = 100;
  for (const c of checks) {
    if (c.status === "warn") score -= 12;
    if (c.status === "fail") score -= 25;
  }
  score = Math.max(20, Math.min(100, score));

  return { score, ip, country, isp, proxy, hosting, https, checks };
}

export default function WifiCheckScreen() {
  const colors = useColors();
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(true);

  const run = async () => {
    setBusy(true);
    try {
      const r = await runWifiCheck();
      setReport(r);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Wi-Fi Safety",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <ScreenContainer>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Network safety check
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Inspect the network you're on right now.
          </Text>
        </View>

        <Card padding={22} style={{ alignItems: "center" }}>
          <ScoreRing
            score={report?.score ?? 0}
            label={
              busy
                ? "Scanning"
                : report && report.score >= 80
                  ? "Network safe"
                  : report && report.score >= 50
                    ? "Be cautious"
                    : "Risky network"
            }
            sublabel={busy ? "Probing connection..." : "Tap rerun to refresh"}
          />
          <View style={{ height: 16 }} />
          <PrimaryButton
            title={busy ? "Scanning network..." : "Rerun check"}
            icon="refresh-cw"
            loading={busy}
            onPress={run}
          />
        </Card>

        {report ? (
          <View>
            <SectionHeader title="Connection details" />
            <Card padding={0}>
              <DetailRow label="Public IP" value={report.ip ?? "Unknown"} />
              <Divider />
              <DetailRow label="Country" value={report.country ?? "Unknown"} />
              <Divider />
              <DetailRow label="ISP / ASN" value={report.isp ?? "Unknown"} />
            </Card>
          </View>
        ) : null}

        {report ? (
          <View>
            <SectionHeader title="Findings" />
            <View style={{ gap: 10 }}>
              {report.checks.map((c, i) => {
                const color =
                  c.status === "ok"
                    ? colors.success
                    : c.status === "warn"
                      ? colors.warning
                      : colors.destructive;
                const icon =
                  c.status === "ok"
                    ? "check-circle"
                    : c.status === "warn"
                      ? "alert-triangle"
                      : "x-octagon";
                return (
                  <Card key={i} padding={14}>
                    <View style={styles.checkRow}>
                      <View
                        style={[
                          styles.icon,
                          { backgroundColor: color + "22", borderRadius: 12 },
                        ]}
                      >
                        <Feather name={icon} size={16} color={color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.checkLabel,
                            { color: colors.foreground },
                          ]}
                        >
                          {c.label}
                        </Text>
                        <Text
                          style={[
                            styles.checkDetail,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {c.detail}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScreenContainer>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[detailStyles.value, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return (
    <View
      style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 18 }}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  checkLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  checkDetail: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 14,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    flex: 1,
  },
  value: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    flex: 2,
    textAlign: "right",
  },
});
