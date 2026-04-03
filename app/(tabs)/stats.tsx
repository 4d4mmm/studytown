import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../src/store/gameStore';
import { COLORS, WORLD_THEMES } from '../../src/constants/theme';

export default function StatsScreen() {
  const { state } = useGame();
  const theme = WORLD_THEMES[state.world];

  const totalHours = (state.totalStudiedMinutes / 60).toFixed(1);
  const buildingsPlaced = state.placedBuildings.length;
  const daysStudied = state.dayRecords.filter((r) => r.completed).length;

  // Last 7 days activity
  const last7Days = (() => {
    const days: { date: string; label: string; completed: boolean; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const record = state.dayRecords.find((r) => r.date === dateStr);
      days.push({
        date: dateStr,
        label: dayNames[d.getDay()],
        completed: record?.completed ?? false,
        minutes: record?.studiedMinutes ?? 0,
      });
    }
    return days;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Progress</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{totalHours}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏗️</Text>
            <Text style={styles.statValue}>{buildingsPlaced}</Text>
            <Text style={styles.statLabel}>Buildings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{state.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{daysStudied}</Text>
            <Text style={styles.statLabel}>Goals Met</Text>
          </View>
        </View>

        {/* Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <View style={styles.chartContainer}>
            {last7Days.map((day, i) => (
              <View key={i} style={styles.chartBarContainer}>
                <View style={styles.chartBarBg}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: `${Math.min((day.minutes / state.dailyGoalMinutes) * 100, 100)}%`,
                        backgroundColor: day.completed ? COLORS.success : theme.palette[0],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartBarLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: COLORS.surfaceLight }]}>
              <Text style={styles.achievementEmoji}>🏅</Text>
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementName}>First Building</Text>
              <Text style={styles.achievementDesc}>Place your first building in the town</Text>
            </View>
            <Text style={styles.achievementStatus}>{buildingsPlaced > 0 ? '✅' : '🔒'}</Text>
          </View>
          <View style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: COLORS.surfaceLight }]}>
              <Text style={styles.achievementEmoji}>🔥</Text>
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementName}>3-Day Streak</Text>
              <Text style={styles.achievementDesc}>Complete your goal 3 days in a row</Text>
            </View>
            <Text style={styles.achievementStatus}>{state.currentStreak >= 3 ? '✅' : '🔒'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    height: 200,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarBg: {
    width: 12,
    height: 120,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartBarLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 8,
    fontWeight: '700',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  achievementDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  achievementStatus: {
    fontSize: 18,
  },
});
