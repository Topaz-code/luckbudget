import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useAuthOnboardingStore } from '../store/authOnboardingStore';
import { colors, fonts, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

const slides = [
  {
    title: 'Lock Your Limits',
    body: 'Set strict boundaries for your spending and watch your savings grow with focused discipline.',
    kind: 'lock',
  },
  {
    title: 'Plan Every Naira',
    body: 'Give income, bills, savings, and daily spending a clear place before the month begins.',
    kind: 'plan',
  },
  {
    title: 'Save Without Temptation',
    body: 'Move money into protected goals and release emergency funds only when you truly need them.',
    kind: 'save',
  },
  {
    title: 'Build Visible Progress',
    body: 'Track your daily discipline, monthly streak, and savings growth without confusing spreadsheets.',
    kind: 'progress',
  },
] as const;

function Illustration({ kind }: { kind: (typeof slides)[number]['kind'] }) {
  const bronze = colors.bronze;
  const amber = colors.gold;
  const ghost = '#D1D5DB';

  if (kind === 'plan') {
    return (
      <Svg width="280" height="250" viewBox="0 0 280 250">
        <Rect x="42" y="34" width="196" height="170" rx="36" fill="none" stroke={ghost} strokeWidth="18" />
        <Circle cx="104" cy="111" r="42" fill="none" stroke={bronze} strokeWidth="12" />
        <Path d="M104 69V111H146" fill="none" stroke={amber} strokeWidth="12" strokeLinecap="round" />
        <Line x1="166" y1="82" x2="210" y2="82" stroke={bronze} strokeWidth="11" strokeLinecap="round" />
        <Line x1="166" y1="116" x2="216" y2="116" stroke={ghost} strokeWidth="11" strokeLinecap="round" />
        <Line x1="66" y1="181" x2="210" y2="181" stroke={amber} strokeWidth="12" strokeLinecap="round" />
      </Svg>
    );
  }

  if (kind === 'save') {
    return (
      <Svg width="280" height="250" viewBox="0 0 280 250">
        <Rect x="44" y="64" width="192" height="132" rx="38" fill="none" stroke={ghost} strokeWidth="18" />
        <Path d="M84 64V46C84 18 106 0 132 0C158 0 180 18 180 46V64" fill="none" stroke={bronze} strokeWidth="13" strokeLinecap="round" />
        <Path d="M140 102L160 112V136C160 158 148 172 140 176C132 172 120 158 120 136V112L140 102Z" fill="none" stroke={bronze} strokeWidth="10" strokeLinejoin="round" />
        <Line x1="68" y1="216" x2="190" y2="216" stroke={amber} strokeWidth="12" strokeLinecap="round" />
        <Line x1="190" y1="216" x2="224" y2="216" stroke={ghost} strokeWidth="12" strokeLinecap="round" />
      </Svg>
    );
  }

  if (kind === 'progress') {
    return (
      <Svg width="280" height="250" viewBox="0 0 280 250">
        <Rect x="44" y="38" width="192" height="166" rx="36" fill="none" stroke={ghost} strokeWidth="18" />
        <Path d="M78 164L116 126L146 146L202 84" fill="none" stroke={bronze} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="202" cy="84" r="10" fill={amber} />
        <Line x1="68" y1="222" x2="190" y2="222" stroke={amber} strokeWidth="12" strokeLinecap="round" />
        <Line x1="190" y1="222" x2="224" y2="222" stroke={ghost} strokeWidth="12" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width="280" height="250" viewBox="0 0 280 250">
      <Path d="M62 92H218C235 92 248 106 248 123V191C248 208 235 222 218 222H62C45 222 32 208 32 191V123C32 106 45 92 62 92Z" fill="none" stroke={ghost} strokeWidth="18" />
      <Path d="M105 104V68C105 45 121 28 140 28C159 28 175 45 175 68V104" fill="none" stroke={bronze} strokeWidth="13" strokeLinecap="round" />
      <Rect x="104" y="88" width="72" height="70" rx="10" fill={colors.background} stroke={bronze} strokeWidth="11" />
      <Circle cx="140" cy="122" r="10" fill={bronze} />
      <Line x1="42" y1="204" x2="184" y2="204" stroke={amber} strokeWidth="12" strokeLinecap="round" />
      <Line x1="184" y1="204" x2="232" y2="204" stroke={ghost} strokeWidth="12" strokeLinecap="round" />
    </Svg>
  );
}

export function AuthWelcomeScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const finishOnboarding = useAuthOnboardingStore((state) => state.finishOnboarding);
  const { height } = useWindowDimensions();
  const slide = slides[index]!;

  const next = () => {
    if (index < slides.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    finishOnboarding();
    navigation.replace('SignUp');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.illustrationArea, { minHeight: Math.min(500, height * 0.54) }]}>
        <View style={styles.illustrationGlow}>
          <Illustration kind={slide.kind} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.dots}>
          {slides.map((item, dotIndex) => (
            <View key={item.title} style={[styles.dot, dotIndex === index && styles.activeDot]} />
          ))}
        </View>
        <Text variant="headlineLarge" style={styles.title}>{slide.title}</Text>
        <Text variant="bodyLarge" style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={index === slides.length - 1 ? 'Create account' : 'Next'}
          onPress={next}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
        >
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  illustrationArea: { alignItems: 'center', justifyContent: 'flex-end' },
  illustrationGlow: { alignItems: 'center', justifyContent: 'center', opacity: 0.98 },
  content: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  dots: { alignItems: 'center', flexDirection: 'row', height: 16, marginBottom: spacing.md },
  dot: { backgroundColor: '#D1D5DB', borderRadius: 6, height: 10, marginHorizontal: 6, width: 10 },
  activeDot: { backgroundColor: colors.bronze, width: 42 },
  title: { color: colors.text, fontFamily: fonts.black, letterSpacing: -0.7, textAlign: 'center' },
  body: { color: colors.textMuted, fontFamily: fonts.regular, lineHeight: 27, marginTop: spacing.md, maxWidth: 410, textAlign: 'center' },
  footer: { alignItems: 'flex-end', flex: 1, justifyContent: 'flex-end', padding: spacing.xl },
  nextButton: { alignItems: 'center', backgroundColor: colors.bronze, borderRadius: 36, elevation: 6, height: 72, justifyContent: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, width: 72 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  arrow: { color: colors.surface, fontSize: 43, fontWeight: '300', lineHeight: 48 },
});
