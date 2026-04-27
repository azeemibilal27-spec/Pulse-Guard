import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  size?: number;
  color?: string;
};

export function PulseLogo({ size = 28, color }: Props) {
  const colors = useColors();
  const c = color ?? colors.primary;

  const dash = useSharedValue(0);

  useEffect(() => {
    dash.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false,
    );
  }, [dash]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 80 * (1 - dash.value),
  }));

  return (
    <View>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path
          d="M16 3 L27 7 V16 C27 22.5 22 27.5 16 29 C10 27.5 5 22.5 5 16 V7 Z"
          fill="none"
          stroke={c}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <AnimatedPath
          d="M8 18 L12 18 L14 13 L18 22 L20 18 L24 18"
          fill="none"
          stroke={c}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="80 80"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}
