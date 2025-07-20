import { DayOfWeek } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
};

export const getDayName = (dayOfWeek: DayOfWeek): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek];
};

export const getNextAlarmTime = (time: Date, repeatDays: DayOfWeek[]): Date => {
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

  if (repeatDays.length === 0) {
    if (alarmTime > now) {
      return alarmTime;
    } else {
      alarmTime.setDate(alarmTime.getDate() + 1);
      return alarmTime;
    }
  }

  const currentDay = now.getDay();
  let daysUntilNext = 0;

  if (repeatDays.includes(currentDay) && alarmTime > now) {
    return alarmTime;
  }

  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (repeatDays.includes(nextDay)) {
      daysUntilNext = i;
      break;
    }
  }

  alarmTime.setDate(alarmTime.getDate() + daysUntilNext);
  return alarmTime;
};

export const calculateSleepDuration = (bedTime: Date, wakeTime: Date): number => {
  const duration = wakeTime.getTime() - bedTime.getTime();
  return Math.round(duration / (1000 * 60));
};

export const generateMathProblem = (): { question: string; answer: number } => {
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1: number, num2: number, answer: number;
  
  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 25;
      num2 = Math.floor(Math.random() * 25) + 1;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
      break;
    default:
      num1 = 5;
      num2 = 3;
      answer = 8;
  }
  
  return {
    question: `${num1} ${operator} ${num2} = ?`,
    answer,
  };
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};
