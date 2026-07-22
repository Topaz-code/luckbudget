import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Surface, Text } from 'react-native-paper';
import { formatNairaFromKobo } from '../../utils/currency';
import { colors, radii, spacing } from '../../theme';

interface BudgetSectionProps {
  title: string;
  subtitle: string;
  totalLabel: string;
  totalKobo: number;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function BudgetSection({
  title,
  subtitle,
  totalLabel,
  totalKobo,
  expanded,
  onToggle,
  children,
}: BudgetSectionProps) {
  return (
    <Surface style={styles.surface} elevation={1}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? 'collapse' : 'expand'}`}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.headingCopy}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.headerTotal}>
          <Text variant="labelSmall" style={styles.totalLabel}>
            {totalLabel}
          </Text>
          <Text variant="titleSmall" style={styles.totalValue}>
            {formatNairaFromKobo(totalKobo)}
          </Text>
        </View>
        <Icon source={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.primary} />
      </Pressable>
      {expanded ? <View style={styles.content}>{children}</View> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.primaryLight },
  headingCopy: { flex: 1, paddingRight: spacing.sm },
  title: { color: colors.primary, fontWeight: '800' },
  subtitle: { color: colors.textMuted, marginTop: 2 },
  headerTotal: { alignItems: 'flex-end', marginRight: spacing.sm },
  totalLabel: { color: colors.textMuted },
  totalValue: { color: colors.text, fontWeight: '700', marginTop: 2 },
  content: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    paddingBottom: 0,
  },
});
