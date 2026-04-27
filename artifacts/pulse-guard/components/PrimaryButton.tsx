import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  fullWidth = true,
}: Props) {
  const colors = useColors();

  const palette = (() => {
    if (variant === "primary")
      return {
        bg: colors.primary,
        fg: colors.primaryForeground,
        border: colors.primary,
      };
    if (variant === "danger")
      return {
        bg: colors.destructive,
        fg: colors.destructiveForeground,
        border: colors.destructive,
      };
    if (variant === "ghost")
      return {
        bg: "transparent",
        fg: colors.foreground,
        border: colors.border,
      };
    return {
      bg: colors.secondary,
      fg: colors.foreground,
      border: colors.secondary,
    };
  })();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: colors.radius,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <>
            {icon ? (
              <Feather
                name={icon}
                size={18}
                color={palette.fg}
                style={{ marginRight: 8 }}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                {
                  color: palette.fg,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
