/**
 * Icon — single-family vector icon wrapper (MaterialCommunityIcons) with
 * token-based sizes and colors. Enforces consistent sizing/stroke per
 * pro-rules (no arbitrary 20/22/28 mixing, no emoji-as-icon).
 */

import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/tokens';

export const iconSizes = { sm: 16, md: 20, lg: 24, xl: 32, '2xl': 40 } as const;

type IconSize = keyof typeof iconSizes;
type ColorToken = keyof typeof colors;

export interface IconProps {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size?: IconSize | number;
  color?: ColorToken | (string & {});
  style?: React.ComponentProps<typeof MaterialCommunityIcons>['style'];
}

const isColorToken = (c: string): c is ColorToken =>
  Object.prototype.hasOwnProperty.call(colors, c);

export const Icon: React.FC<IconProps> = ({ name, size = 'md', color = 'textPrimary', style }) => {
  const resolvedSize = typeof size === 'number' ? size : iconSizes[size];
  const resolvedColor = isColorToken(color) ? colors[color] : color;
  return <MaterialCommunityIcons name={name} size={resolvedSize} color={resolvedColor} style={style} />;
};

export default Icon;
