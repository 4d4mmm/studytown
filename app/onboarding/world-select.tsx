import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useGame } from '../../src/store/gameStore';
import { COLORS, WORLD_THEMES } from '../../src/constants/theme';
import { WorldType } from '../../src/types/game';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_MARGIN = 16;

const worlds: WorldType[] = ['hospital', 'city', 'park'];

export default function WorldSelect() {
  const { dispatch } = useGame();
  const [activeIndex, setActiveIndex] = useState(1);
  const scaleAnims = useRef(worlds.map(() => new Animated.Value(1))).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setActiveIndex(index);
      
      // Animate scale
      worlds.forEach((_, i) => {
        Animated.spring(scaleAnims[i], {
          toValue: i === index ? 1.1 : 0.9,
          useNativeDriver: true,
          friction: 8,
        }).start();
      });
    }
  }).current;

  const handleSelect = (world: WorldType) => {
    dispatch({ type: 'SET_WORLD', world });
    router.push('/onboarding/daily-goal');
  };

  const renderItem = ({ item, index }: { item: WorldType; index: number }) => {
    const theme = WORLD_THEMES[item];
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          { transform: [{ scale: scaleAnims[index] }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.bgAccent, borderColor: theme.palette[0] }]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.9}
        >
          <Text style={styles.cardEmoji}>{theme.emoji}</Text>
          <Text style={styles.cardTitle}>{theme.name}</Text>
          <Text style={styles.cardDesc}>{theme.description}</Text>
          
          <View style={[styles.selectButton, { backgroundColor: theme.palette[0] }]}>
            <Text style={styles.selectButtonText}>Select World</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your World</Text>
        <Text style={styles.subtitle}>
          Each world has unique buildings and themes to unlock as you study.
        </Text>
      </View>

      <FlatList
        data={worlds}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(item) => item}
      />

      <View style={styles.indicatorContainer}>
        {worlds.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicator,
              i === activeIndex && styles.indicatorActive,
              i === activeIndex && { backgroundColor: WORLD_THEMES[worlds[i]].palette[0] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
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
  listContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2 - CARD_MARGIN,
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    height: 400,
  },
  card: {
    flex: 1,
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  selectButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  selectButtonText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 24,
  },
});
