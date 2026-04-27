import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import {
  type ScanResult,
  verdictColor,
  verdictLabel,
} from "@/lib/scanner";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type Props = {
  result: ScanResult;
  onPress?: () => void;
};

export function HistoryRow({ result, onPress }: Props) {
  const colors = useColors();
  const accent = verdictColor(result.verdict, colors);
  const icon =
    result.verdict === "clean"
      ? "check-circle"
      : result.verdict === "suspicious"
        ? "alert-triangle"
        : result.verdict === "malicious"
          ? "x-octagon"
          : "help-circle";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: accent + "22", borderRadius: 12 },
        ]}
      >
        <Feather name={icon} size={18} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={[styles.query, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {result.query}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {result.type.toUpperCase()} • {timeAgo(result.scannedAt)}
        </Text>
      </View>
      <Text style={[styles.verdict, { color: accent }]}>
        {verdictLabel(result.verdict)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  query: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  verdict: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
