export const colors = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#66BB6A',

  secondary: '#8D6E63',

  background: '#F7F9F7',
  surface: '#FFFFFF',

  text: '#1F2937',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',

  border: '#E5E7EB',
  divider: '#E5E7EB',

  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;