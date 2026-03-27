export type Category = 'Study' | 'Coding' | 'Personal';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: Category;
  createdAt: number;
  completedAt?: number;
  dueDate?: number; // timestamp
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface ProductivityLog {
  date: string; // ISO format
  codingHours: number;
  tasksCompleted: number;
  focusMinutes: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  pomodoroTime: number;
  breakTime: number;
  codingGoal: number; // in hours
}

export interface RelapseRecord {
  date: number;
  reason: string;
}

export interface RecoveryState {
  startDate: number | null;
  relapseHistory: RelapseRecord[];
}
