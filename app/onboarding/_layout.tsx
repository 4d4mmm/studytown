import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="world-select" />
      <Stack.Screen name="daily-goal" />
    </Stack>
  );
}
