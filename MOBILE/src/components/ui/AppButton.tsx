/**
 * AppButton — primary / secondary / ghost pill button.
 *
 * - Primary uses the brand gradient + cyan glow.
 * - Optional trailing icon is nested in its own circular wrapper
 *   ("Button-in-Button", per high-end-visual-design).
 * - Press feedback via AnimatedPressable (spring scale + haptics).
 * - Loading and disabled states are first-class; text stays contrast-safe.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from './AnimatedPressable';
import { Text } from './Text';
import { Icon } from './Icon';
import { colors, gradients, radius, space, shadow, hitTarget } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';
type IconName = React.ComponentProps<typeof Icon>['name'];

export interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const HEIGHTS: Record<Size, number> = { md: 54, sm: 44 };

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  disabled = false,
  fullWidth = true,
  haptic = true,
  style,
  accessibilityLabel,
}) => {
  const height = HEIGHTS[size];
  const isDisabled = disabled || loading;
  const contentColor =
    variant === 'primary' ? colors.onPrimary : variant === 'secondary' ? colors.textPrimary : colors.textStrong;

  const surfaceStyle: ViewStyle = {
    height,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  };

  const body = (
    <>
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} size="md" color={contentColor} /> : null}
          <Text variant={size === 'sm' ? 'bodyStrong' : 'title'} color={contentColor} numberOfLines={1}>
            {label}
          </Text>
          {trailingIcon ? (
            <View
              style={[
                styles.trailingWrap,
                { backgroundColor: variant === 'primary' ? 'rgba(255,255,255,0.18)' : colors.primaryTint },
              ]}
            >
              <Icon name={trailingIcon} size="sm" color={variant === 'primary' ? colors.onPrimary : colors.primary} />
            </View>
          ) : null}
        </>
      )}
    </>
  );

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      haptic={haptic}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        fullWidth ? styles.fullWidth : undefined,
        { minHeight: hitTarget, opacity: isDisabled ? 0.55 : 1 },
        variant === 'primary' ? shadow.brandGlow : undefined,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={surfaceStyle}>
          {body}
        </LinearGradient>
      ) : (
        <View
          style={[
            surfaceStyle,
            variant === 'secondary'
              ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              : { backgroundColor: 'transparent' },
          ]}
        >
          {body}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  trailingWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.xs,
  },
});

export default AppButton;
