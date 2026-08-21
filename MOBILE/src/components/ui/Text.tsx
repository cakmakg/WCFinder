/**
 * Text — typed typography component bound to design tokens.
 * Replaces raw <Text> / Paper <Text variant=…> so every string uses Plus
 * Jakarta Sans at a consistent scale and semantic color.
 */

import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, typography } from '../../theme/tokens';

type Variant = keyof typeof typography;
type ColorToken = keyof typeof colors;

export interface AppTextProps extends RNTextProps {
  variant?: Variant;
  color?: ColorToken | (string & {});
  center?: boolean;
  uppercase?: boolean;
}

const isColorToken = (c: string): c is ColorToken =>
  Object.prototype.hasOwnProperty.call(colors, c);

export const Text: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  center,
  uppercase,
  style,
  ...rest
}) => {
  const resolvedColor = isColorToken(color) ? colors[color] : color;
  const base = typography[variant];
  const composed: TextStyle = {
    ...base,
    color: resolvedColor,
    ...(center ? { textAlign: 'center' } : null),
    ...(uppercase ? { textTransform: 'uppercase' } : null),
  };
  return <RNText style={[composed, style]} {...rest} />;
};

export default Text;
