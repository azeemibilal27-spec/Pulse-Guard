import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(67, insets.top) : insets.top;
  const bottomPad = isWeb ? 84 + 16 : insets.bottom + 24;

  const baseStyle = {
    paddingTop: topPad + 16,
    paddingBottom: bottomPad,
    paddingHorizontal: 18,
    gap: 18,
  } as ViewStyle;

  if (!scroll) {
    return (
      <View
        style={[
          styles.fill,
          { backgroundColor: colors.background },
          baseStyle,
          contentStyle,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: colors.background }]}
      contentContainerStyle={[baseStyle, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
