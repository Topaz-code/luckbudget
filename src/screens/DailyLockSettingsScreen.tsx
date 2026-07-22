import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Button, Icon, SegmentedButtons, Surface, Text } from 'react-native-paper';
import type { DailyLockPreference } from '../features/expenses/dailyLock';
import { saveDailyLockPreference } from '../services/firebase/dailyLockRepository';
import { useDailyLockStore } from '../store/dailyLockStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyLockSettings'>;

export function DailyLockSettingsScreen({ navigation }: Props) {
  const storedPreference = useDailyLockStore((state) => state.preference);
  const hasHydrated = useDailyLockStore((state) => state.hasHydrated);
  const setStoredPreference = useDailyLockStore((state) => state.setPreference);
  const [preference, setPreference] = useState<DailyLockPreference>(storedPreference);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setStoredPreference(preference);

    try {
      await saveDailyLockPreference(preference);
      navigation.goBack();
    } catch (reason) {
      setError(
        `${reason instanceof Error ? reason.message : 'Cloud sync failed.'} Your choice is saved on this device.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Loading your preference…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text variant="headlineSmall" style={styles.heading}>How should unspent money behave?</Text>
      <Text variant="bodyMedium" style={styles.intro}>
        You can change this whenever your routine changes.
      </Text>

      <SegmentedButtons
        value={preference}
        onValueChange={(value) => setPreference(value as DailyLockPreference)}
        buttons={[
          { value: 'rollover', label: 'Roll over', icon: 'refresh' },
          { value: 'reset', label: 'Reset daily', icon: 'calendar-today' },
        ]}
        style={styles.segmented}
      />

      <Surface style={styles.explanation} elevation={1}>
        <View style={styles.explanationIcon}>
          <Icon
            source={preference === 'rollover' ? 'piggy-bank-outline' : 'shield-check-outline'}
            size={28}
            color={colors.primary}
          />
        </View>
        <View style={styles.flexOne}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {preference === 'rollover' ? 'Reward careful spending' : 'Start fresh each day'}
          </Text>
          <Text variant="bodyMedium" style={styles.cardCopy}>
            {preference === 'rollover'
              ? 'Money you do not spend today is added to a future day’s available allowance.'
              : 'Unused allowance closes at midnight. Tomorrow starts with only its base allowance.'}
          </Text>
        </View>
      </Surface>

      {error ? (
        <Text variant="bodyMedium" style={styles.error} accessibilityRole="alert">{error}</Text>
      ) : null}

      <View style={styles.spacer} />
      <Button
        mode="contained"
        icon="content-save-outline"
        onPress={() => void handleSave()}
        loading={isSaving}
        disabled={isSaving}
        contentStyle={styles.button}
      >
        Save Preference
      </Button>
      {error ? (
        <Button mode="text" onPress={() => navigation.goBack()}>Back to Dashboard</Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, padding: spacing.md },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
  heading: { color: colors.text, fontWeight: '800' },
  intro: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.sm },
  segmented: { marginVertical: spacing.lg },
  explanation: { alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', padding: spacing.md },
  explanationIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 24, height: 48, justifyContent: 'center', marginRight: spacing.md, width: 48 },
  flexOne: { flex: 1 },
  cardTitle: { color: colors.primary, fontWeight: '800' },
  cardCopy: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.xs },
  error: { color: colors.warning, marginTop: spacing.md },
  spacer: { flex: 1 },
  button: { minHeight: 48 },
});
