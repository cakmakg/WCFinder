/**
 * Reveal — staggered entrance animation (fade + rise) for lists and sections.
 * Uses reanimated layout-entering; falls back to a static view when the OS
 * reduced-motion setting is on. Motion is transform/opacity only.
 */

import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { motion } from '../../theme/tokens';

export interface RevealProps {
  children: React.ReactNode;
  /** position in a list — drives the stagger delay */
  index?: number;
  /** extra base delay in ms */
  delay?: number;
  /** ms between staggered items (default 60) */
  step?: number;
  style?: StyleProp<ViewStyle>;
}

export const Reveal: React.FC<RevealProps> = ({ children, index = 0, delay = 0, step = 60, style }) => {
  const reduce = useReducedMotion();
  if (reduce) return <View style={style}>{children}</View>;
  return (
    <Animated.View
      entering={FadeInDown.springify()
        .damping(motion.spring.default.damping)
        .stiffness(motion.spring.default.stiffness)
        .delay(delay + index * step)}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

export default Reveal;
