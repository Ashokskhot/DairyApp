import React, { PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
} from '../../theme';

interface CardProps extends PropsWithChildren {
  style?: ViewStyle;
  padding?: number;
}

export function Card({
  children,
  style,
  padding = spacing.lg,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 2,
  },
});