/**
 * AnimatedPressable — spring-physics press feedback (scale) + optional haptics.
 *
 * The press only animates `transform` (never layout bounds) per pro-rules, and
 * respects the OS reduced-motion setting. Default hitSlop keeps small controls
 * at the ≥44pt effective target.
 */

import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { motion } from '../../theme/tokens';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** target scale while pressed (default from motion tokens) */
  pressScale?: number;
  /** fire a light haptic on press-in (default true) */
  haptic?: boolean;
  children?: React.ReactNode;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  style,
  pressScale = motion.pressScale,
  haptic = true,
  disabled,
  onPressIn,
  onPressOut,
  children,
  hitSlop = 8,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const reduce = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      if (!reduce) scale.value = withSpring(pressScale, motion.spring.press);
      if (haptic && !disabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPressIn?.(e);
    },
    [reduce, pressScale, haptic, disabled, onPressIn, scale]
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (e) => {
      if (!reduce) scale.value = withSpring(1, motion.spring.press);
      onPressOut?.(e);
    },
    [reduce, onPressOut, scale]
  );

  return (
    <AnimatedPressableBase
      style={[style, animatedStyle]}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
};

export default AnimatedPressable;
