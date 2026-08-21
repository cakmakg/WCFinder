/**
 * Badge — small status/label pill with a semantic tone.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, radius, space } from '../../theme/tokens';

type Tone = 'primary' | 'success' | 'error' | 'neutral';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primaryTint, fg: colors.primaryDark },
  success: { bg: colors.successTint, fg: colors.success },
  error: { bg: colors.errorTint, fg: colors.error },
  neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
};

export interface BadgeProps {
  label: string;
  tone?: Tone;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'primary' }) => {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text variant="label" color={t.fg} uppercase>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.full,
  },
});

export default Badge;
