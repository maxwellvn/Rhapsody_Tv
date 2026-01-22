import { FONTS } from '@/styles/global';
import { fs, hp, spacing } from '@/utils/responsive';
import { StyleSheet, Switch, Text, View } from 'react-native';

type SettingsItemToggleProps = {
  label: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsItemToggle({ 
  label, 
  description, 
  value = false, 
  onValueChange,
  disabled = false,
}: SettingsItemToggleProps) {
  const handleToggle = (newValue: boolean) => {
    if (!disabled) {
      onValueChange?.(newValue);
    }
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          trackColor={{ false: '#E5E5E5', true: '#93C5FD' }}
          thumbColor={value ? '#2563EB' : '#FFFFFF'}
          ios_backgroundColor="#E5E5E5"
          onValueChange={handleToggle}
          value={value}
          disabled={disabled}
        />
      </View>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: hp(10),
    backgroundColor: '#F5F5F5',
  },
  disabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#171717',
    flex: 1,
  },
  description: {
    fontSize: fs(14),
    fontFamily: FONTS.regular,
    color: '#737373',
    marginTop: hp(2),
    lineHeight: fs(18),
  },
});
