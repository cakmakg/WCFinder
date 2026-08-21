/**
 * Card & GlassCard — surface primitives for the Soft Glass system.
 *
 * - `Card` is the standard elevated surface (soft tinted shadow, token radius).
 *   `bezel` turns on the Double-Bezel nested architecture (outer tray + inner
 *   core with an edge highlight) from high-end-visual-design.
 * - `GlassCard` is a frosted BlurView surface for content over gradients/imagery.
 *
 * Passing `onPress` makes either card a spring-pressable target.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { AnimatedPressable } from './AnimatedPressable';
import { colors, radius, space, shadow } from '../../theme/tokens';

type Elevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevation?: Elevation;
  bezel?: boolean;
  /** cyan left accent bar (matches existing accent-box language) */
  accent?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = space.base,
  elevation = 'sm',
  bezel = false,
  accent = false,
  onPress,
}) => {
  const shadowStyle = shadow[elevation];

  const inner = (
    <View
      style={[
        styles.inner,
        { padding, borderRadius: bezel ? radius.lg : radius.lg },
        accent ? styles.accent : null,
      ]}
    >
      {children}
    </View>
  );

  const content = bezel ? (
    <View style={[styles.bezelShell, shadowStyle, style]}>{inner}</View>
  ) : (
    <View style={[styles.card, shadowStyle, accent ? styles.accent : null, { padding }, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} haptic={false} style={styles.pressReset}>
        {content}
      </AnimatedPressable>
    );
  }
  return content;
};

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  intensity?: number;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = space.base,
  intensity = 40,
  onPress,
}) => {
  const content = (
    <BlurView intensity={intensity} tint="light" style={[styles.glass, { padding }, style]}>
      {children}
    </BlurView>
  );
  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} haptic={false} style={styles.pressReset}>
        {content}
      </AnimatedPressable>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassHighlight,
  },
  inner: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassHighlight,
  },
  bezelShell: {
    backgroundColor: 'rgba(15,23,42,0.035)',
    borderRadius: radius.xl,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  accent: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  glass: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pressReset: {
    borderRadius: radius.lg,
  },
});

export default Card;
