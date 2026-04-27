import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tint?: string;
};

export function StatPill({ icon, label, value, tint }: Props) {
  const colors = useColors();
  const accent = tint ?? colors.primary;
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: accent + "22", borderRadius: 12 },
        ]}
      >
        <Feather name={icon} size={16} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 2,
  },
});
