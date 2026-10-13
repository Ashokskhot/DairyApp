import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AccountMenuItemProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export function AccountMenuItem({
  icon,
  title,
  description,
  onPress,
}: AccountMenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.icon}>
        {icon}
      </Text>

      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      <Text style={styles.arrow}>
        ›
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  icon: {
    fontSize: 23,
    width: 42,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  description: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  arrow: {
    fontSize: 27,
    color: '#AAA',
  },
});