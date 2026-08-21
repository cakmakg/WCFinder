/**
 * SectionHeader — section title with an optional eyebrow and right-side action.
 * Eyebrows are used sparingly (not above every section) per the taste rules.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { space } from '../../theme/tokens';

export interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, eyebrow, right }) => (
  <View style={styles.row}>
    <View style={styles.textWrap}>
      {eyebrow ? (
        <Text variant="eyebrow" color="primary" uppercase style={styles.eyebrow}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="h2">{title}</Text>
    </View>
    {right ? <View>{right}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  textWrap: { flex: 1 },
  eyebrow: { marginBottom: space.xs },
});

export default SectionHeader;
