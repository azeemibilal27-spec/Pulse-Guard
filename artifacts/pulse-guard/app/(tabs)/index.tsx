import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { HistoryRow } from "@/components/HistoryRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PulseLogo } from "@/components/PulseLogo";
import { ScoreRing } from "@/components/ScoreRing";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatPill } from "@/components/StatPill";
import { useSecurity } from "@/context/SecurityContext";
import { useColors } from "@/hooks/useColors";

const SCAN_STAGES = [
  "Initializing scan engine...",
  "Checking system integrity...",
  "Auditing app permissions...",
  "Scanning installed packages...",
  "Inspecting network configuration...",
  "Querying threat intelligence cloud...",
  "Verifying browser & download history...",
  "Finalizing security report...",
];

export default function HomeScreen() {
  const colors = useColors();
  const { history, threatCount, protectionScore, lastFullScan, markFullScan } =
    useSecurity();

  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const runFullScan = () => {
    if (scanning) return;
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    setScanning(true);
    setStage(0);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: SCAN_STAGES.length * 600,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (!scanning) return;
    if (stage >= SCAN_STAGES.length - 1) {
      const t = setTimeout(() => {
        setScanning(false);
        markFullScan();
        if (Platform.OS !== "web")
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => s + 1), 600);
    return () => clearTimeout(t);
  }, [scanning, stage, markFullScan]);

  const lastScanText = lastFullScan
    ? `Last scan: ${new Date(lastFullScan).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "No full scan yet";

  const widthInterp = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <PulseLogo size={32} />
          <View>
            <Text style={[styles.brand, { color: colors.foreground }]}>
              PulseGuard
            </Text>
            <Text
              style={[styles.tagline, { color: colors.mutedForeground }]}
            >
              Cloud-powered protection
            </Text>
          </View>
        </View>
      </View>

      <Card padding={22} style={{ alignItems: "center" }}>
        <ScoreRing score={protectionScore} sublabel={lastScanText} />
        <View style={{ height: 18 }} />
        {scanning ? (
          <View style={{ width: "100%" }}>
            <Text
              style={[styles.stageText, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {SCAN_STAGES[stage]}
            </Text>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: widthInterp,
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          <PrimaryButton
            title="Run Smart Scan"
            icon="shield"
            onPress={runFullScan}
          />
        )}
      </Card>

      <View style={styles.statsRow}>
        <StatPill
          icon="alert-octagon"
          label="Threats"
          value={String(threatCount)}
          tint={threatCount > 0 ? colors.destructive : colors.success}
        />
        <StatPill
          icon="search"
          label="Scans"
          value={String(history.length)}
        />
        <StatPill
          icon="zap"
          label="Engine"
          value="Live"
          tint={colors.success}
        />
      </View>

      <View>
        <SectionHeader
          title="Protection status"
          subtitle="Real-time defense across the device"
        />
        <Card padding={0}>
          <StatusRow
            icon="globe"
            title="Web protection"
            description="Live URL & phishing checks"
            ok
          />
          <Divider />
          <StatusRow
            icon="wifi"
            title="Network monitor"
            description="Watching Wi-Fi & open ports"
            ok
          />
          <Divider />
          <StatusRow
            icon="lock"
            title="Cloud threat database"
            description="URLhaus & MalwareBazaar online"
            ok
          />
          <Divider />
          <StatusRow
            icon="shield"
            title="App audit"
            description="Permission risks scanned daily"
            ok
          />
        </Card>
      </View>

      <View>
        <SectionHeader
          title="Recent activity"
          action={
            history.length > 3 ? (
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
                onPress={() => router.push("/(tabs)/history")}
              >
                See all
              </Text>
            ) : null
          }
        />
        {history.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Feather name="activity" size={28} color={colors.mutedForeground} />
              <Text
                style={[styles.emptyTitle, { color: colors.foreground }]}
              >
                No scans yet
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.mutedForeground },
                ]}
              >
                Use the Scanner tab to check a link, IP, domain, or file hash.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {history.slice(0, 3).map((item) => (
              <HistoryRow
                key={item.id}
                result={item}
                onPress={() =>
                  router.push({
                    pathname: "/scan-result",
                    params: { id: item.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

function StatusRow({
  icon,
  title,
  description,
  ok,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  ok: boolean;
}) {
  const colors = useColors();
  const accent = ok ? colors.success : colors.warning;
  return (
    <View style={statusStyles.row}>
      <View
        style={[
          statusStyles.icon,
          { backgroundColor: accent + "22", borderRadius: 12 },
        ]}
      >
        <Feather name={icon} size={16} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[statusStyles.title, { color: colors.foreground }]}
        >
          {title}
        </Text>
        <Text
          style={[
            statusStyles.desc,
            { color: colors.mutedForeground },
          ]}
        >
          {description}
        </Text>
      </View>
      <View
        style={[
          statusStyles.dot,
          { backgroundColor: accent },
        ]}
      />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  stageText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 18,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});

const statusStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
