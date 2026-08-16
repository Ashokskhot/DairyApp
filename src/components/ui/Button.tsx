import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;

  variant?: ButtonVariant;
  size?: ButtonSize;

  disabled?: boolean;
  loading?: boolean;

  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[`${variant}Button`],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor(variant)}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

function getTextColor(variant: ButtonVariant) {
  switch (variant) {
    case 'outline':
      return colors.primary;

    case 'secondary':
      return colors.text;

    case 'danger':
      return colors.white;

    case 'primary':
    default:
      return colors.white;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  small: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },

  medium: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },

  large: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.secondary,
  },

  outlineButton: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  dangerButton: {
    backgroundColor: colors.error,
  },

  text: {
    ...typography.button,
  },

  primaryText: {
    color: colors.white,
  },

  secondaryText: {
    color: colors.text,
  },

  outlineText: {
    color: colors.primary,
  },

  dangerText: {
    color: colors.white,
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },
});