import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  tint?: string;
  onPress: () => void;
};

export function ToolTile({ icon, title, description, tint, onPress }: Props) {
  const colors = useColors();
  const accent = tint ?? colors.primary;

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web")
          Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: accent + "1f",
            borderRadius: 14,
          },
        ]}
      >
        <Feather name={icon} size={22} color={accent} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text
        style={[styles.desc, { color: colors.mutedForeground }]}
        numberOfLines={2}
      >
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    minHeight: 140,
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
});
