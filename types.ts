
export type User = 'Thiago' | 'Marcela';

export type MealTime = '07:00' | '12:00' | '16:00' | '20:00' | '23:00';

export interface Meal {
  id: string;
  userId: User;
  weekNumber: number;
  dayOfWeek: number; // 0 (Mon) to 4 (Fri)
  time: MealTime;
  food: string;
  amount: string;
  calories: number;
  consumed: boolean;
}

export interface WeightLog {
  userId: User;
  date: string;
  weight: number;
}

export interface WaterLog {
  userId: User;
  date: string;
  amountMl: number;
}

export interface ExerciseLog {
  userId: User;
  date: string;
  completed: boolean;
}

export interface ShoppingItem {
  id: string;
  weekNumber: number;
  userId: User;
  name: string;
  bought: boolean;
}

export interface AppState {
  meals: Meal[];
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  exerciseLogs: ExerciseLog[];
  shoppingLists: ShoppingItem[];
}
