export interface Alarm {
  id: string;
  time: Date;
  label: string;
  isEnabled: boolean;
  repeatDays: DayOfWeek[];
  sound: string;
  dismissMethod: DismissMethod;
  createdAt: Date;
  updatedAt: Date;
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum DismissMethod {
  BUTTON = 'button',
  MATH = 'math',
}

export interface NapTimer {
  duration: number; // in minutes
  remaining: number; // in minutes
  isActive: boolean;
  isPaused: boolean;
}

export interface SleepRecord {
  id: string;
  date: string;
  bedTime: Date;
  wakeTime: Date;
  totalSleep: number; // in minutes
}

export interface AppSettings {
  isDarkMode: boolean;
  defaultSound: string;
  defaultDismissMethod: DismissMethod;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
}

export type RootStackParamList = {
  MainTabs: undefined;
  EditAlarm: { alarm?: Alarm };
};

export type MainTabParamList = {
  Alarms: undefined;
  NapTimer: undefined;
  Analytics: undefined;
  Settings: undefined;
};
