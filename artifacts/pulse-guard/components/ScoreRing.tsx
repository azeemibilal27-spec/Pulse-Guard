import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
};

export function ScoreRing({
  score,
  size = 220,
  label,
  sublabel,
}: Props) {
  const colors = useColors();
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, score)) / 100, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const ringColor =
    score >= 80
      ? colors.success
      : score >= 50
        ? colors.warning
        : colors.destructive;

  const status =
    label ??
    (score >= 80 ? "Protected" : score >= 50 ? "At risk" : "Vulnerable");

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.secondary}
          strokeWidth={stroke}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          fill="transparent"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.score, { color: colors.foreground }]}>
          {Math.round(score)}
        </Text>
        <Text style={[styles.label, { color: ringColor }]}>{status}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, { color: colors.mutedForeground }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  },
  sublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
});
