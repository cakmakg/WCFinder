/**
 * LottieAnim — plays a Lottie animation (key moments: payment success, empty
 * states, onboarding). Honours reduced motion by rendering a static last frame.
 * Assets live in assets/lottie/ (added at the asset checkpoint).
 */

import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { useReducedMotion } from 'react-native-reanimated';

export interface LottieAnimProps {
  source: string | { uri: string } | object;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LottieAnim: React.FC<LottieAnimProps> = ({
  source,
  size = 160,
  loop = false,
  autoPlay = true,
  style,
}) => {
  const reduce = useReducedMotion();
  return (
    <LottieView
      source={source as any}
      autoPlay={autoPlay && !reduce}
      loop={loop && !reduce}
      progress={reduce ? 1 : undefined}
      style={[{ width: size, height: size }, style]}
    />
  );
};

export default LottieAnim;
