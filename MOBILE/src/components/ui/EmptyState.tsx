/**
 * EmptyState — composed empty/placeholder view with a 3D icon or Lottie, a
 * title, a description and an optional primary action. Replaces bare "no data"
 * text.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ImageSource } from 'expo-image';
import { Text } from './Text';
import { Icon3D } from './Icon3D';
import { LottieAnim } from './LottieAnim';
import { AppButton } from './AppButton';
import { space } from '../../theme/tokens';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** 3D icon asset (preferred for static empties) */
  icon?: ImageSource | number;
  /** Lottie asset (for animated empties) — takes precedence over icon */
  lottie?: string | { uri: string } | object;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  lottie,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    {lottie ? (
      <LottieAnim source={lottie} size={160} loop />
    ) : icon ? (
      <Icon3D source={icon} size={112} accessibilityLabel={title} />
    ) : null}

    <Text variant="title" center style={styles.title}>
      {title}
    </Text>
    {description ? (
      <Text variant="body" color="textSecondary" center style={styles.description}>
        {description}
      </Text>
    ) : null}

    {actionLabel && onAction ? (
      <View style={styles.action}>
        <AppButton label={actionLabel} onPress={onAction} fullWidth={false} />
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space['2xl'],
    paddingHorizontal: space.lg,
  },
  title: { marginTop: space.base },
  description: { marginTop: space.sm, maxWidth: 300 },
  action: { marginTop: space.lg },
});

export default EmptyState;
