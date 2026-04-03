import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../src/store/gameStore';
import { COLORS, GRID_SIZE, WORLD_THEMES } from '../../src/constants/theme';
import { BUILDINGS_BY_WORLD, getBuildingById } from '../../src/constants/buildings';
import { Building, PlacedBuilding } from '../../src/constants/buildings';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const TILE_SIZE = (width - GRID_PADDING * 2 - (GRID_SIZE - 1) * 2) / GRID_SIZE;

export default function TownScreen() {
  const { state, dispatch } = useGame();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showShop, setShowShop] = useState(false);
  const placeAnims = useRef<Record<string, Animated.Value>>({}).current;

  const theme = WORLD_THEMES[state.world];
  const buildings = BUILDINGS_BY_WORLD[state.world];

  const handlePlaceBuilding = (row: number, col: number) => {
    if (!selectedBuilding) return;
    if (state.coins < selectedBuilding.cost) return;

    // Check if space is occupied
    const isOccupied = state.placedBuildings.some(
      (pb) => pb.row === row && pb.col === col
    );
    if (isOccupied) return;

    const newPlaced: PlacedBuilding = {
      buildingId: selectedBuilding.id,
      row,
      col,
      placedAt: Date.now(),
    };

    dispatch({ type: 'PLACE_BUILDING', building: newPlaced });
    setSelectedBuilding(null);
  };

  const renderGrid = () => {
    const grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const placed = state.placedBuildings.find((pb) => pb.row === r && pb.col === c);
        const building = placed ? getBuildingById(placed.buildingId) : null;

        row.push(
          <TouchableOpacity
            key={`${r}-${c}`}
            style={[
              styles.tile,
              {
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: building ? building.color : COLORS.gridEmpty,
                borderColor: COLORS.gridLine,
              },
            ]}
            onPress={() => handlePlaceBuilding(r, c)}
            disabled={!!placed && !selectedBuilding}
          >
            {building && (
              <Text style={styles.buildingEmoji}>
                {building.name.charAt(0)}
              </Text>
            )}
          </TouchableOpacity>
        );
      }
      grid.push(
        <View key={r} style={styles.row}>
          {row}
        </View>
      );
    }
    return grid;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{theme.name} Town</Text>
          <Text style={styles.subtitle}>{state.placedBuildings.length} buildings placed</Text>
        </View>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>🪙 {state.coins}</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>{renderGrid()}</View>

      <View style={styles.footer}>
        {selectedBuilding ? (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              Placing: {selectedBuilding.name}
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedBuilding(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: theme.palette[0] }]}
            onPress={() => setShowShop(true)}
          >
            <Text style={styles.shopButtonText}>🏗️ Build Something</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showShop} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Architect's Shop</Text>
              <TouchableOpacity onPress={() => setShowShop(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.shopList}>
              {buildings.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.shopItem,
                    state.coins < b.cost && styles.shopItemDisabled,
                  ]}
                  onPress={() => {
                    if (state.coins >= b.cost) {
                      setSelectedBuilding(b);
                      setShowShop(false);
                    }
                  }}
                >
                  <View style={[styles.buildingPreview, { backgroundColor: b.color }]}>
                    <Text style={styles.previewEmoji}>{b.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.shopItemInfo}>
                    <Text style={styles.buildingName}>{b.name}</Text>
                    <Text style={styles.buildingSize}>
                      Size: {b.width}x{b.height}
                    </Text>
                  </View>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>🪙 {b.cost}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
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
  gridContainer: {
    padding: GRID_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    margin: 1,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingEmoji: {
    fontSize: 16,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  shopButton: {
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
  shopButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  selectionText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  closeText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  shopList: {
    paddingBottom: 40,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  shopItemDisabled: {
    opacity: 0.5,
  },
  buildingPreview: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  previewEmoji: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
  },
  shopItemInfo: {
    flex: 1,
  },
  buildingName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  buildingSize: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    color: COLORS.accent,
    fontWeight: '800',
  },
});
