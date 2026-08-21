/**
 * Chip — selectable pill (e.g. gender, filters). Selected = brand fill,
 * unselected = muted surface. Spring press feedback, ≥44pt target.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { Text } from './Text';
import { Icon } from './Icon';
import { colors, radius, space, hitTarget } from '../../theme/tokens';

type IconName = React.ComponentProps<typeof Icon>['name'];

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, icon }) => {
  const fg = selected ? colors.onPrimary : colors.textSecondary;
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.selected : styles.unselected]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size="sm" color={fg} /> : null}
        <Text variant="bodyStrong" color={fg}>
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    minHeight: hitTarget,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  selected: { backgroundColor: colors.primary },
  unselected: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
});

export default Chip;
