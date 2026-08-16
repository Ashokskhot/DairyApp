import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  spacing,
  typography,
} from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
        },
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={onBackPress}
            hitSlop={10}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </Pressable>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && (
        <View style={styles.rightAction}>
          {rightAction}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },

  backIcon: {
    fontSize: 36,
    lineHeight: 38,
    color: colors.text,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    ...typography.title,
    color: colors.text,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },

  rightAction: {
    marginLeft: spacing.md,
  },
});