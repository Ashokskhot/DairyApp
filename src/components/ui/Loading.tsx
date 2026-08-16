import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  spacing,
  typography,
} from '../../theme';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({
  message,
  fullScreen = false,
}: LoadingProps) {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
      ]}
    >
      <ActivityIndicator
        size="large"
        color={colors.primary}
      />

      {message && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  fullScreen: {
    flex: 1,
  },

  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});