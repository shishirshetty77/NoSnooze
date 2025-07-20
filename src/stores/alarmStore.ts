import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Alarm, DismissMethod, DayOfWeek } from '../types';
import { generateId } from '../utils';

interface AlarmStore {
  alarms: Alarm[];
  isLoading: boolean;
  recentlyDeleted: Alarm | null;
  undoTimeoutId: NodeJS.Timeout | null;
  
  // Actions
  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearRecentlyDeleted: () => void;
  duplicateAlarm: (id: string) => Promise<void>;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],
      isLoading: false,
      recentlyDeleted: null,
      undoTimeoutId: null,

      loadAlarms: async () => {
        set({ isLoading: true });
        try {
          // Alarms are loaded from persist middleware
          set({ isLoading: false });
        } catch (error) {
          console.error('Error loading alarms:', error);
          set({ isLoading: false });
        }
      },

      addAlarm: async (alarmData) => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          const newAlarm: Alarm = {
            ...alarmData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            alarms: [...state.alarms, newAlarm].sort(
              (a, b) => a.time.getTime() - b.time.getTime()
            )
          }));
        } catch (error) {
          console.error('Error adding alarm:', error);
          throw error;
        }
      },

      updateAlarm: async (id, updates) => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          set(state => ({
            alarms: state.alarms.map(alarm =>
              alarm.id === id
                ? { ...alarm, ...updates, updatedAt: new Date() }
                : alarm
            ).sort((a, b) => a.time.getTime() - b.time.getTime())
          }));
        } catch (error) {
          console.error('Error updating alarm:', error);
          throw error;
        }
      },

      deleteAlarm: async (id) => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          const state = get();
          const alarmToDelete = state.alarms.find(alarm => alarm.id === id);
          
          if (!alarmToDelete) return;

          // Clear any existing undo timeout
          if (state.undoTimeoutId) {
            clearTimeout(state.undoTimeoutId);
          }

          // Set up undo functionality
          const undoTimeoutId = setTimeout(() => {
            set({ recentlyDeleted: null, undoTimeoutId: null });
          }, 5000);

          set(state => ({
            alarms: state.alarms.filter(alarm => alarm.id !== id),
            recentlyDeleted: alarmToDelete,
            undoTimeoutId,
          }));
        } catch (error) {
          console.error('Error deleting alarm:', error);
          throw error;
        }
      },

      toggleAlarm: async (id) => {
        try {
          const state = get();
          const alarm = state.alarms.find(a => a.id === id);
          
          if (!alarm) return;

          // Provide different haptic feedback based on state
          if (alarm.isEnabled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          set(state => ({
            alarms: state.alarms.map(a =>
              a.id === id
                ? { ...a, isEnabled: !a.isEnabled, updatedAt: new Date() }
                : a
            )
          }));
        } catch (error) {
          console.error('Error toggling alarm:', error);
          throw error;
        }
      },

      undoDelete: async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          const state = get();
          if (!state.recentlyDeleted) return;

          if (state.undoTimeoutId) {
            clearTimeout(state.undoTimeoutId);
          }

          set(state => ({
            alarms: [...state.alarms, state.recentlyDeleted!].sort(
              (a, b) => a.time.getTime() - b.time.getTime()
            ),
            recentlyDeleted: null,
            undoTimeoutId: null,
          }));
        } catch (error) {
          console.error('Error undoing delete:', error);
          throw error;
        }
      },

      clearRecentlyDeleted: () => {
        const state = get();
        if (state.undoTimeoutId) {
          clearTimeout(state.undoTimeoutId);
        }
        set({ recentlyDeleted: null, undoTimeoutId: null });
      },

      duplicateAlarm: async (id) => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          const state = get();
          const originalAlarm = state.alarms.find(alarm => alarm.id === id);
          
          if (!originalAlarm) return;

          const duplicatedAlarm: Alarm = {
            ...originalAlarm,
            id: generateId(),
            label: `${originalAlarm.label} Copy`,
            isEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set(state => ({
            alarms: [...state.alarms, duplicatedAlarm].sort(
              (a, b) => a.time.getTime() - b.time.getTime()
            )
          }));
        } catch (error) {
          console.error('Error duplicating alarm:', error);
          throw error;
        }
      },
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      serialize: (state) => {
        const serializedState = {
          ...state,
          // Convert dates to strings for JSON serialization
          state: {
            ...state.state,
            alarms: state.state.alarms.map(alarm => ({
              ...alarm,
              time: alarm.time.toISOString(),
              createdAt: alarm.createdAt.toISOString(),
              updatedAt: alarm.updatedAt.toISOString(),
            })),
            recentlyDeleted: state.state.recentlyDeleted ? {
              ...state.state.recentlyDeleted,
              time: state.state.recentlyDeleted.time.toISOString(),
              createdAt: state.state.recentlyDeleted.createdAt.toISOString(),
              updatedAt: state.state.recentlyDeleted.updatedAt.toISOString(),
            } : null,
            undoTimeoutId: null, // Don't persist timeout
          }
        };
        return JSON.stringify(serializedState);
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          state: {
            ...parsed.state,
            // Convert strings back to dates
            alarms: parsed.state.alarms.map((alarm: any) => ({
              ...alarm,
              time: new Date(alarm.time),
              createdAt: new Date(alarm.createdAt),
              updatedAt: new Date(alarm.updatedAt),
            })),
            recentlyDeleted: parsed.state.recentlyDeleted ? {
              ...parsed.state.recentlyDeleted,
              time: new Date(parsed.state.recentlyDeleted.time),
              createdAt: new Date(parsed.state.recentlyDeleted.createdAt),
              updatedAt: new Date(parsed.state.recentlyDeleted.updatedAt),
            } : null,
            undoTimeoutId: null,
          }
        };
      },
      partialize: (state) => ({
        alarms: state.alarms,
      }),
    }
  )
);
