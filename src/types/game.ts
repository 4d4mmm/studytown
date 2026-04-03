export type WorldType = 'hospital' | 'city' | 'park';

export interface Building {
  id: string;
  name: string;
  cost: number;
  color: string;
  width: number;
  height: number;
}

export interface PlacedBuilding {
  buildingId: string;
  row: number;
  col: number;
  placedAt: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  studiedMinutes: number;
  goalMinutes: number;
  completed: boolean;
  coinsEarned: number;
}

export interface GameState {
  // Onboarding
  onboardingComplete: boolean;
  world: WorldType;
  dailyGoalMinutes: number;
  
  // Game Data
  coins: number;
  isTimerRunning: boolean;
  timerStartedAt: number | null;
  todayStudiedSeconds: number;
  placedBuildings: PlacedBuilding[];
  
  // Stats
  currentStreak: number;
  totalStudiedMinutes: number;
  totalCoinsEarned: number;
  dayRecords: DayRecord[];
  lastActiveDate: string;
}
