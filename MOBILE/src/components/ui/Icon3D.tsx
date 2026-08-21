/**
 * Icon3D — renders a 3D icon asset (PNG/WebP) via expo-image with crisp
 * downscaling. Use for hero glyphs, feature tiles, and empty states.
 * Assets live in assets/icons3d/ (added at the asset checkpoint).
 */

import React from 'react';
import { Image, type ImageSource } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

export interface Icon3DProps {
  source: ImageSource | number;
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

export const Icon3D: React.FC<Icon3DProps> = ({ source, size = 64, style, accessibilityLabel }) => (
  <Image
    source={source}
    style={[{ width: size, height: size }, style]}
    contentFit="contain"
    accessible={!!accessibilityLabel}
    accessibilityLabel={accessibilityLabel}
    transition={200}
  />
);

export default Icon3D;
