/**
 * ScreenHeader — brand gradient header with safe-area top inset, optional back
 * button (spring press), title, subtitle and a right-side slot. Keeps fixed UI
 * clear of the notch/status bar per pro-rules.
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from './AnimatedPressable';
import { Text } from './Text';
import { Icon } from './Icon';
import { colors, gradients, space, radius, hitTarget } from '../../theme/tokens';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, right }) => {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? space.xs : space.sm) }]}
    >
      <View style={styles.row}>
        {onBack ? (
          <AnimatedPressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Zurück" style={styles.iconBtn}>
            <Icon name="arrow-left" size="lg" color="onDark" />
          </AnimatedPressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={styles.titleWrap}>
          {title ? (
            <Text variant="title" color="onDark" numberOfLines={1} center>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="caption" color={colors.glassHighlight} numberOfLines={1} center>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.iconBtn}>{right}</View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space.md,
    paddingBottom: space.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: hitTarget,
    height: hitTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1, alignItems: 'center' },
});

export default ScreenHeader;
