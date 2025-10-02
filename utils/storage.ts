

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppState {
  allTexts: string[];
  availableTexts: string[];
  usedTexts: string[];
  currentText: string | null;
  isAutoSendEnabled: boolean;
  selectedDays: boolean[];
  timeWindow: { start: string; end: string };
  messagesPerDay: number;
  schedules: { id: string; timestamp: number; text: string }[];
}

const STORAGE_KEY = 'persian_excel_app_state';

const defaultState: AppState = {
  allTexts: [],
  availableTexts: [],
  usedTexts: [],
  currentText: null,
  isAutoSendEnabled: false,
  selectedDays: [false, false, false, false, false, false, false],
  timeWindow: { start: '09:00', end: '17:00' },
  messagesPerDay: 1,
  schedules: [],
};

export class StorageService {
  static async getAppState(): Promise<AppState> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultState, ...parsed };
      }
      return defaultState;
    } catch (error) {
      console.log('Error getting app state:', error);
      return defaultState;
    }
  }

  static async saveAppState(state: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('App state saved successfully');
    } catch (error) {
      console.log('Error saving app state:', error);
      throw error;
    }
  }

  static async addTexts(newTexts: string[]): Promise<{ added: number; duplicates: number }> {
    try {
      const currentState = await this.getAppState();
      const existingTexts = new Set(currentState.allTexts);
      
      const uniqueNewTexts = newTexts.filter(text => !existingTexts.has(text));
      const duplicateCount = newTexts.length - uniqueNewTexts.length;

      const updatedState: AppState = {
        ...currentState,
        allTexts: [...currentState.allTexts, ...uniqueNewTexts],
        availableTexts: [...currentState.availableTexts, ...uniqueNewTexts],
      };

      await this.saveAppState(updatedState);
      
      return {
        added: uniqueNewTexts.length,
        duplicates: duplicateCount,
      };
    } catch (error) {
      console.log('Error adding texts:', error);
      throw error;
    }
  }

  static async getRandomText(): Promise<string | null> {
    try {
      const currentState = await this.getAppState();
      
      if (currentState.availableTexts.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * currentState.availableTexts.length);
      const selectedText = currentState.availableTexts[randomIndex];

      // Remove from available and add to used
      const updatedAvailableTexts = currentState.availableTexts.filter((_, index) => index !== randomIndex);
      const updatedUsedTexts = [...currentState.usedTexts, selectedText];

      const updatedState: AppState = {
        ...currentState,
        availableTexts: updatedAvailableTexts,
        usedTexts: updatedUsedTexts,
        currentText: selectedText,
      };

      await this.saveAppState(updatedState);
      
      return selectedText;
    } catch (error) {
      console.log('Error getting random text:', error);
      throw error;
    }
  }

  static async resetProgress(): Promise<void> {
    try {
      const currentState = await this.getAppState();
      
      const updatedState: AppState = {
        ...currentState,
        availableTexts: [...currentState.allTexts],
        usedTexts: [],
        currentText: null,
      };

      await this.saveAppState(updatedState);
    } catch (error) {
      console.log('Error resetting progress:', error);
      throw error;
    }
  }

  static async updateAutoSendSettings(
    isEnabled: boolean,
    selectedDays: boolean[],
    timeWindow: { start: string; end: string },
    messagesPerDay: number
  ): Promise<void> {
    try {
      const currentState = await this.getAppState();
      
      const updatedState: AppState = {
        ...currentState,
        isAutoSendEnabled: isEnabled,
        selectedDays,
        timeWindow,
        messagesPerDay,
      };

      await this.saveAppState(updatedState);
    } catch (error) {
      console.log('Error updating auto send settings:', error);
      throw error;
    }
  }

  static async addSchedule(schedule: { id: string; timestamp: number; text: string }): Promise<void> {
    try {
      const currentState = await this.getAppState();
      
      const updatedState: AppState = {
        ...currentState,
        schedules: [...currentState.schedules, schedule],
      };

      await this.saveAppState(updatedState);
    } catch (error) {
      console.log('Error adding schedule:', error);
      throw error;
    }
  }

  static async removeSchedule(scheduleId: string): Promise<void> {
    try {
      const currentState = await this.getAppState();
      
      const updatedState: AppState = {
        ...currentState,
        schedules: currentState.schedules.filter(s => s.id !== scheduleId),
      };

      await this.saveAppState(updatedState);
    } catch (error) {
      console.log('Error removing schedule:', error);
      throw error;
    }
  }

  static async getDueSchedules(): Promise<{ id: string; timestamp: number; text: string }[]> {
    try {
      const currentState = await this.getAppState();
      const now = Date.now();
      
      return currentState.schedules.filter(schedule => schedule.timestamp <= now);
    } catch (error) {
      console.log('Error getting due schedules:', error);
      return [];
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('All data cleared successfully');
    } catch (error) {
      console.log('Error clearing all data:', error);
      throw error;
    }
  }
}
