import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TextInput, Tooltip } from 'react-native-paper';
import { formatEditableNaira, sanitizeNairaInput } from '../../features/budget/calculations';
import { colors, radii, spacing } from '../../theme';

interface CurrencyInputProps {
  label: string;
  description: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CurrencyInput({
  label,
  description,
  hint,
  value,
  onChange,
  disabled = false,
}: CurrencyInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.labelCopy}>
          <Text variant="titleSmall" style={styles.label}>
            {label}
          </Text>
          <Text variant="bodySmall" style={styles.description}>
            {description}
          </Text>
        </View>
        <Tooltip title={hint} enterTouchDelay={100} leaveTouchDelay={3000}>
          <IconButton
            icon="information-outline"
            size={19}
            iconColor={colors.primary}
            accessibilityLabel={`${label} information: ${hint}`}
            style={styles.infoButton}
          />
        </Tooltip>
      </View>
      <TextInput
        mode="outlined"
        value={formatEditableNaira(value)}
        onChangeText={(text) => onChange(sanitizeNairaInput(text))}
        left={<TextInput.Affix text="₦" />}
        placeholder="0"
        keyboardType="decimal-pad"
        inputMode="decimal"
        maxLength={16}
        disabled={disabled}
        accessibilityLabel={`${label} amount in Naira`}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        style={styles.input}
        contentStyle={styles.inputContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  labelRow: { flexDirection: 'row', alignItems: 'flex-start' },
  labelCopy: { flex: 1 },
  label: { color: colors.text, fontWeight: '700' },
  description: { color: colors.textMuted, marginTop: 2 },
  infoButton: { margin: -6, marginLeft: spacing.sm },
  input: { backgroundColor: colors.surface, marginTop: spacing.sm, borderRadius: radii.sm },
  inputContent: { fontSize: 17, fontWeight: '600' },
});
