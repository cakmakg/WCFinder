/**
 * PriceRow — label/value line for order summaries. `total` emphasises the row
 * (larger, brand-colored value).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { space } from '../../theme/tokens';

export interface PriceRowProps {
  label: string;
  value: string;
  total?: boolean;
}

export const PriceRow: React.FC<PriceRowProps> = ({ label, value, total = false }) => (
  <View style={styles.row}>
    <Text variant={total ? 'title' : 'body'} color={total ? 'textPrimary' : 'textSecondary'}>
      {label}
    </Text>
    <Text variant={total ? 'h2' : 'bodyStrong'} color={total ? 'primary' : 'textPrimary'}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
  },
});

export default PriceRow;
