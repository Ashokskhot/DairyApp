import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

import { Card } from '../ui';
import { FarmerMilkTypes } from '../../types/Farmer';

interface FarmerCardProps {
  name: string;
  mobile: string;
  milkTypes: FarmerMilkTypes;
  onPress: () => void;
}

function getMilkTypeLabel(
  milkTypes: FarmerMilkTypes,
) {
  if (milkTypes.cow && milkTypes.buffalo) {
    return '🐄 Cow + 🐃 Buffalo';
  }

  if (milkTypes.cow) {
    return '🐄 Cow';
  }

  if (milkTypes.buffalo) {
    return '🐃 Buffalo';
  }

  return 'No milk type';
}

export function FarmerCard({
  name,
  mobile,
  milkTypes,
  onPress,
}: FarmerCardProps) {
  const initial = name
    ? name.charAt(0).toUpperCase()
    : '?';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initial}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {name}
          </Text>

          <Text style={styles.mobile}>
            {mobile}
          </Text>

          <Text style={styles.milkType}>
            {getMilkTypeLabel(milkTypes)}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    borderRadius: radius.md,
  },

  pressed: {
    opacity: 0.85,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },

  info: {
    flex: 1,
    marginLeft: spacing.md,
  },

  name: {
    ...typography.subheading,
    color: colors.text,
  },

  mobile: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  milkType: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: spacing.xs,
  },

  arrow: {
    fontSize: 30,
    color: colors.textDisabled,
  },
});