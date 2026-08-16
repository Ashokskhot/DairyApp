import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  required = false,
  style,
  ...textInputProps
}: InputProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && (
            <Text style={styles.required}> *</Text>
          )}
        </Text>
      )}

      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          hasError && styles.inputError,
          textInputProps.editable === false && styles.inputDisabled,
          style,
        ]}
        placeholderTextColor={
          textInputProps.placeholderTextColor ?? colors.textSecondary
        }
      />

      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },

  label: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  required: {
    color: colors.error,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
  },

  inputError: {
    borderColor: colors.error,
  },

  inputDisabled: {
    backgroundColor: colors.background,
    color: colors.textDisabled,
  },

  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },

  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});