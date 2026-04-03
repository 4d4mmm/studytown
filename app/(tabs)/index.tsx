import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../src/store/gameStore';
import { COLORS, WORLD_THEMES } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const coinBounce = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theme = WORLD_THEMES[state.world];
  const goalSeconds = state.dailyGoalMinutes * 60;
  const totalStudied = state.todayStudiedSeconds + (state.isTimerRunning ? sessionSeconds : 0);
  const progress = Math.min(totalStudied / goalSeconds, 1);
  const goalComplete = totalStudied >= goalSeconds;
  const prevGoalComplete = useRef(false);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Check if goal just completed
  useEffect(() => {
    if (goalComplete && !prevGoalComplete.current) {
      prevGoalComplete.current = true;
      dispatch({ type: 'COMPLETE_DAILY_GOAL' });
      Animated.sequence([
        Animated.timing(coinBounce, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(coinBounce, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [goalComplete]);

  // Pulse animation when timer running
  useEffect(() => {
    if (state.isTimerRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state.isTimerRunning]);

  // Timer tick
  useEffect(() => {
    if (state.isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isTimerRunning]);

  const handleToggleTimer = useCallback(() => {
    if (state.isTimerRunning) {
      dispatch({ type: 'STOP_TIMER', elapsedSeconds: sessionSeconds });
      setSessionSeconds(0);
    } else {
      dispatch({ type: 'START_TIMER' });
      setSessionSeconds(0);
    }
  }, [state.isTimerRunning, sessionSeconds, dispatch]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.worldLabel}>{theme.emoji} {WORLD_THEMES[state.world].name}</Text>
        <Animated.View style={[styles.coinBadge, { transform: [{ scale: coinBounce }] }]}>
          <Text style={styles.coinText}>🪙 {state.coins}</Text>
        </Animated.View>
      </View>

      {/* Streak */}
      {state.currentStreak > 0 && (
        <View style={styles.streakBanner}>
          <Text style={styles.streakText}>🔥 {state.currentStreak} day streak!</Text>
        </View>
      )}

      {/* Timer Circle */}
      <View style={styles.timerSection}>
        <Animated.View
          style={[
            styles.timerCircle,
            {
              borderColor: goalComplete ? COLORS.success : theme.palette[0],
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.timerDisplay}>
            {state.isTimerRunning ? formatTime(sessionSeconds) : formatTime(totalStudied)}
          </Text>
          <Text style={styles.timerLabel}>
            {state.isTimerRunning
              ? 'Studying...'
              : goalComplete
              ? 'Goal Complete! 🎉'
              : `Goal: ${state.dailyGoalMinutes}m`}
          </Text>
        </Animated.View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>
          {Math.floor(totalStudied / 60)}m / {state.dailyGoalMinutes}m
        </Text>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
                backgroundColor: goalComplete ? COLORS.success : theme.palette[0],
              },
            ]}
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: state.isTimerRunning ? COLORS.primary : COLORS.success },
          ]}
          onPress={handleToggleTimer}
        >
          <Text style={styles.mainButtonText}>
            {state.isTimerRunning ? 'Stop Session' : 'Start Studying'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  worldLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  coinBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  coinText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  streakBanner: {
    backgroundColor: 'rgba(255, 217, 61, 0.1)',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  timerDisplay: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 40,
  },
  progressLabel: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  controls: {
    marginBottom: 20,
  },
  mainButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
