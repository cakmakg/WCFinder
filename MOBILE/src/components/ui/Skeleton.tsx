/**
 * Skeleton — shape-matching loading placeholder (pulse). Replaces generic
 * spinners for content that has a known layout. Pulse respects reduced motion.
 */

import React, { useEffect } from 'react';
import { StyleSheet, type DimensionValue, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { colors, radius as radiusTokens } from '../../theme/tokens';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = radiusTokens.sm,
  style,
}) => {
  const opacity = useSharedValue(0.5);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      opacity.value = 0.7;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduce, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius }, animatedStyle, style]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceAlt,
  },
});

export default Skeleton;
