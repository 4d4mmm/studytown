import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useGame } from '../../src/store/gameStore';
import { COLORS, WORLD_THEMES } from '../../src/constants/theme';

const PRESETS = [15, 30, 45, 60, 90, 120];

export default function DailyGoal() {
  const { state, dispatch } = useGame();
  const [selected, setSelected] = useState(30);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const theme = WORLD_THEMES[state.world];

  const handleSelect = (mins: number) => {
    setSelected(mins);
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_GOAL', minutes: selected });
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Set Your Daily Goal</Text>
        <Text style={styles.subtitle}>
          How many minutes do you want to study each day?
        </Text>
      </View>

      <View style={styles.grid}>
        {PRESETS.map((mins) => (
          <TouchableOpacity
            key={mins}
            style={[
              styles.card,
              selected === mins && { borderColor: theme.palette[0], backgroundColor: COLORS.surfaceLight },
            ]}
            onPress={() => handleSelect(mins)}
          >
            <Text style={[styles.cardValue, selected === mins && { color: theme.palette[0] }]}>
              {mins}
            </Text>
            <Text style={styles.cardLabel}>mins</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.palette[0] }]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Start Building</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
