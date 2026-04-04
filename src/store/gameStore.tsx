import { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, WorldType, PlacedBuilding, DayRecord } from '../types/game';
import { COINS_PER_GOAL, STREAK_BONUS } from '../constants/theme';
import { saveGameState, loadGameState } from '../lib/storage';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function createInitialState(): GameState {
  return {
    onboardingComplete: false,
    world: 'city',
    dailyGoalMinutes: 30,
    coins: 0,
    isTimerRunning: false,
    timerStartedAt: null,
    todayStudiedSeconds: 0,
    placedBuildings: [],
    currentStreak: 0,
    totalStudiedMinutes: 0,
    totalCoinsEarned: 0,
    dayRecords: [],
    lastActiveDate: getTodayString(),
  };
}

type GameAction =
  | { type: 'SET_WORLD'; world: WorldType }
  | { type: 'SET_GOAL'; minutes: number }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'START_TIMER' }
  | { type: 'STOP_TIMER'; elapsedSeconds: number }
  | { type: 'PLACE_BUILDING'; building: PlacedBuilding }
  | { type: 'COMPLETE_DAILY_GOAL' }
  | { type: 'LOAD_STATE'; state: GameState };

function gameReducer(state: GameState, action: GameAction): GameState {
  let newState = state;
  switch (action.type) {
    case 'SET_WORLD':
      newState = { ...state, world: action.world };
      break;
    case 'SET_GOAL':
      newState = { ...state, dailyGoalMinutes: action.minutes };
      break;
    case 'COMPLETE_ONBOARDING':
      newState = { ...state, onboardingComplete: true };
      break;
    case 'START_TIMER':
      newState = { ...state, isTimerRunning: true, timerStartedAt: Date.now() };
      break;
    case 'STOP_TIMER':
      const newStudiedSeconds = state.todayStudiedSeconds + action.elapsedSeconds;
      newState = {
        ...state,
        isTimerRunning: false,
        timerStartedAt: null,
        todayStudiedSeconds: newStudiedSeconds,
        totalStudiedMinutes: state.totalStudiedMinutes + Math.floor(action.elapsedSeconds / 60),
      };
      break;
    case 'PLACE_BUILDING':
      newState = {
        ...state,
        placedBuildings: [...state.placedBuildings, action.building],
      };
      break;
    case 'COMPLETE_DAILY_GOAL':
      const today = getTodayString();
      const alreadyCompleted = state.dayRecords.some(r => r.date === today && r.completed);
      if (alreadyCompleted) return state;

      const newCoins = state.coins + COINS_PER_GOAL;
      const newDayRecord: DayRecord = {
        date: today,
        studiedMinutes: Math.floor(state.todayStudiedSeconds / 60),
        goalMinutes: state.dailyGoalMinutes,
        completed: true,
        coinsEarned: COINS_PER_GOAL,
      };

      newState = {
        ...state,
        coins: newCoins,
        totalCoinsEarned: state.totalCoinsEarned + COINS_PER_GOAL,
        dayRecords: [...state.dayRecords, newDayRecord],
        currentStreak: state.currentStreak + 1,
      };
      break;
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
  saveGameState(newState);
  return newState;
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  useEffect(() => {
    loadGameState().then(savedState => {
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', state: savedState });
      }
    });
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
