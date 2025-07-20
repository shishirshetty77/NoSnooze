import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AppSettings, SleepRecord, DismissMethod } from '../types';
import { STORAGE_KEYS } from '../constants';

const defaultSettings: AppSettings = {
  isDarkMode: false,
  defaultSound: 'Default',
  defaultDismissMethod: DismissMethod.BUTTON,
  notificationsEnabled: true,
  vibrationEnabled: true,
};

class StorageService {
  async getAlarms(): Promise<Alarm[]> {
    try {
      const alarmsJson = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
      if (alarmsJson) {
        const alarms = JSON.parse(alarmsJson);
        return alarms.map((alarm: any) => ({
          ...alarm,
          time: new Date(alarm.time),
          createdAt: new Date(alarm.createdAt),
          updatedAt: new Date(alarm.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting alarms:', error);
      return [];
    }
  }

  async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      const alarmsJson = JSON.stringify(alarms);
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, alarmsJson);
    } catch (error) {
      console.error('Error saving alarms:', error);
      throw error;
    }
  }

  async addAlarm(alarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      alarms.push(alarm);
      await this.saveAlarms(alarms);
    } catch (error) {
      console.error('Error adding alarm:', error);
      throw error;
    }
  }

  async updateAlarm(updatedAlarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      const index = alarms.findIndex(alarm => alarm.id === updatedAlarm.id);
      if (index !== -1) {
        alarms[index] = { ...updatedAlarm, updatedAt: new Date() };
        await this.saveAlarms(alarms);
      }
    } catch (error) {
      console.error('Error updating alarm:', error);
      throw error;
    }
  }

  async deleteAlarm(alarmId: string): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      const filteredAlarms = alarms.filter(alarm => alarm.id !== alarmId);
      await this.saveAlarms(filteredAlarms);
    } catch (error) {
      console.error('Error deleting alarm:', error);
      throw error;
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        return { ...defaultSettings, ...JSON.parse(settingsJson) };
      }
      return defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, settingsJson);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getSleepRecords(): Promise<SleepRecord[]> {
    try {
      const recordsJson = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_RECORDS);
      if (recordsJson) {
        const records = JSON.parse(recordsJson);
        return records.map((record: any) => ({
          ...record,
          bedTime: new Date(record.bedTime),
          wakeTime: new Date(record.wakeTime),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting sleep records:', error);
      return [];
    }
  }

  async saveSleepRecord(record: SleepRecord): Promise<void> {
    try {
      const records = await this.getSleepRecords();
      records.push(record);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filteredRecords = records.filter(r => new Date(r.date) >= thirtyDaysAgo);
      
      const recordsJson = JSON.stringify(filteredRecords);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_RECORDS, recordsJson);
    } catch (error) {
      console.error('Error saving sleep record:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ALARMS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.SLEEP_RECORDS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
